import { config } from './environment.js';

const BASE_COOKIE = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict',
};

export const ACCESS_COOKIE_OPTIONS = { ...BASE_COOKIE, maxAge: 15 * 60 * 1000 };
export const REFRESH_COOKIE_OPTIONS = {
  ...BASE_COOKIE,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth/refresh',
};
