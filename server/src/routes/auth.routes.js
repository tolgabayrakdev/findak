import { Router } from 'express';
import { authController } from '../container.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { authenticate } from '../middleware/authenticate.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/logout', authenticate, authController.logout);

export default router;
