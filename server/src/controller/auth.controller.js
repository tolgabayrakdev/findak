import { AuthService } from '../service/auth.service.js';
import { config } from '../config/environment.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  register = async (req, res, next) => {
    try {
      const token = await this.authService.register(req.body);
      res.cookie('token', token, COOKIE_OPTIONS).status(201).json({ message: 'Registered successfully' });
    } catch (err) {
      next(err);
    }
  };

  login = async (req, res, next) => {
    try {
      const token = await this.authService.login(req.body);
      res.cookie('token', token, COOKIE_OPTIONS).json({ message: 'Logged in successfully' });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req, res) => {
    res.clearCookie('token').json({ message: 'Logged out successfully' });
  };
}
