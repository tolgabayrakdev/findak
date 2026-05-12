# Silent Refresh — Frontend Implementasyonu

## Kavram

Access token (15dk) expire olduğunda kullanıcıya login ekranı göstermek yerine,
arka planda `/auth/refresh` çağrısı yapıp yeni token alınır ve asıl istek tekrarlanır.
Kullanıcı hiçbir şey fark etmez.

---

## Akış

```
İstek atıldı
    │
    ▼
API → 401 döndü mü?
    │
   Evet
    │
    ▼
/auth/refresh çağrısı yap
    │
    ├── Başarılı → asıl isteği tekrar at → kullanıcıya sonucu dön
    │
    └── Başarısız (refresh token da expire) → logout → login sayfasına yönlendir
```

---

## Axios ile Implementasyon

### 1. Axios instance oluştur

```js
// src/lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, // cookie'lerin gönderilmesi için şart
});

export default api;
```

> `withCredentials: true` olmazsa tarayıcı cookie'leri göndermez.

---

### 2. Response interceptor ekle

```js
// src/lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

let isRefreshing = false;
let waitingQueue = [];

function resolveQueue(error = null) {
  waitingQueue.forEach((cb) => cb(error));
  waitingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 değilse veya zaten retry denendiyse direkt hata fırlat
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Aynı anda birden fazla istek 401 alırsa hepsini sıraya al
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waitingQueue.push((err) => {
          if (err) return reject(err);
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post('/auth/refresh'); // cookie otomatik güncellenir
      resolveQueue();
      return api(originalRequest);
    } catch (refreshError) {
      resolveQueue(refreshError);
      // Refresh token da geçersiz → logout
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
```

---

### 3. Kullanım

Artık uygulamanın her yerinde bu `api` instance'ını kullan.
Token yönetimi tamamen otomatik çalışır.

```js
// Herhangi bir component veya service
import api from '@/lib/api';

const { data } = await api.get('/persons');
const { data } = await api.post('/persons', { firstName: 'Ali', lastName: 'Veli' });
```

---

## Neden `waitingQueue` Gerekli?

15 dakikalık access token expire olduğunda, sayfada aynı anda birden fazla istek atılıyor olabilir
(örn. dashboard açılınca 3 farklı endpoint çağrılıyor). Hepsi 401 alır.

Queue olmadan:
```
İstek A → 401 → /refresh çağrısı başlatıldı
İstek B → 401 → /refresh çağrısı başlatıldı  ← ikinci gereksiz refresh!
İstek C → 401 → /refresh çağrısı başlatıldı  ← üçüncü gereksiz refresh!
```

Queue ile:
```
İstek A → 401 → /refresh başlatıldı, isRefreshing = true
İstek B → 401 → isRefreshing true, sıraya eklendi
İstek C → 401 → isRefreshing true, sıraya eklendi
              ↓
         /refresh tamamlandı
              ↓
         A, B, C hepsi orijinal isteklerini tekrar atar
```

---

## React Query veya SWR Kullananlar İçin

Query client'a global error handler ekle, interceptor yerine buradan yönet:

```js
// React Query örneği
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: async (error, query) => {
      if (error.response?.status === 401) {
        try {
          await api.post('/auth/refresh');
          queryClient.invalidateQueries({ queryKey: query.queryKey });
        } catch {
          window.location.href = '/login';
        }
      }
    },
  }),
});
```

---

## Fetch ile Implementasyon

Fetch'in interceptor mekanizması olmadığı için native `fetch`'i saran bir wrapper fonksiyon yazılır.
Mantık axios ile aynıdır, sadece elle yönetilir.

### 1. Fetch wrapper oluştur

```js
// src/lib/api.js
const BASE_URL = 'http://localhost:5000';

let isRefreshing = false;
let waitingQueue = [];

function resolveQueue(error = null) {
  waitingQueue.forEach((cb) => cb(error));
  waitingQueue = [];
}

async function refreshTokens() {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // cookie gönderimi için şart
  });

  if (!res.ok) throw new Error('Refresh failed');
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include', // her istekte cookie gönder
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // 401 değilse direkt dön
  if (res.status !== 401) return res;

  // Zaten retry denendiyse sonsuz döngüye girme
  if (options._retry) {
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  // Başka bir refresh zaten devam ediyorsa sıraya gir
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      waitingQueue.push(async (err) => {
        if (err) return reject(err);
        try {
          resolve(await apiFetch(path, { ...options, _retry: true }));
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  isRefreshing = true;

  try {
    await refreshTokens();
    resolveQueue();
    return apiFetch(path, { ...options, _retry: true });
  } catch (err) {
    resolveQueue(err);
    window.location.href = '/login';
    throw err;
  } finally {
    isRefreshing = false;
  }
}

export default apiFetch;
```

---

### 2. Kullanım

```js
import apiFetch from '@/lib/api';

// GET
const res = await apiFetch('/persons');
const data = await res.json();

// POST
const res = await apiFetch('/persons', {
  method: 'POST',
  body: JSON.stringify({ firstName: 'Ali', lastName: 'Veli' }),
});
const data = await res.json();

// Hata kontrolü
if (!res.ok) {
  const error = await res.json();
  throw new Error(error.message);
}
```

---

### 3. Axios ile Farkları

| | Axios | Fetch |
|---|---|---|
| Interceptor | Yerleşik, temiz | Yok, wrapper yazılır |
| 401 tespiti | `error.response.status` | `res.status` (throw etmez!) |
| Cookie | `withCredentials: true` | `credentials: 'include'` |
| JSON parse | Otomatik | `await res.json()` elle |
| Retry | `error.config` ile kolay | Options nesnesini taşımak gerekir |

> **Önemli:** Fetch, 4xx/5xx yanıtlarında hata **fırlatmaz**. `res.ok` veya `res.status`
> ile elle kontrol etmen gerekir. Axios'ta 4xx otomatik olarak catch'e düşer.

---

## Backend Tarafıyla Bağlantı

| Frontend Aksiyonu          | Backend Endpoint          | Açıklama                                      |
|----------------------------|---------------------------|-----------------------------------------------|
| İlk giriş                  | `POST /auth/login`        | `accessToken` (15dk) + `refreshToken` (7gün) cookie'ye yazılır |
| Sessiz token yenileme      | `POST /auth/refresh`      | Her iki cookie de yenilenir (token rotation)  |
| Çıkış                      | `POST /auth/logout`       | Cookie'ler temizlenir, DB'deki token silinir  |

---

## Önemli Notlar

- **`withCredentials: true`** her istekte olmalı, yoksa cookie gönderilmez.
- Refresh başarısız olunca kullanıcıyı `/login`'e yönlendir, local state'i temizle.
- `_retry` flag'i sonsuz döngüyü engeller: `/refresh` isteğinin kendisi de 401 alırsa tekrar refresh denenmez.
- Backend CORS ayarlarında `credentials: true` ve doğru `origin` tanımlı olmalı.
