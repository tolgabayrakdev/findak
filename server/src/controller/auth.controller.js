import { AuthService } from '../service/auth.service.js';
import { ACCESS_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from '../config/cookie.config.js';
import UnauthorizedException from '../exceptions/UnauthorizedException.js';

export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  register = async (req, res, next) => {
    try {
      await this.authService.register(req.body);
      res.status(201).json({ message: 'Registered successfully' });
    } catch (err) {
      next(err);
    }
  };

  login = async (req, res, next) => {
    try {
      const { accessToken, refreshToken } = await this.authService.login(req.body);
      res
        .cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS)
        .cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
        .json({ message: 'Logged in successfully' });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) throw new UnauthorizedException('No refresh token provided');

      const { accessToken, refreshToken } = await this.authService.refresh(token);
      res
        .cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS)
        .cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
        .json({ message: 'Token refreshed successfully' });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req, res, next) => {
    try {
      if (req.user?.id) await this.authService.logout(req.user.id);
      res
        .clearCookie('accessToken')
        .clearCookie('refreshToken', { path: '/api/auth/refresh' })
        .json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  };
}
