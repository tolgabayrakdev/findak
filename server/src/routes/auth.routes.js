import { Router } from 'express';
import { AuthController } from '../controller/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { authenticate } from '../middleware/authenticate.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();
const authController = new AuthController();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/logout', authenticate, authController.logout);

export default router;
