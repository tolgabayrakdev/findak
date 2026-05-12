import { AuthService } from '../service/auth.service.js';
import { config } from '../config/environment.js';
import UnauthorizedException from '../exceptions/UnauthorizedException.js';

const BASE_COOKIE = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict',
};

const ACCESS_COOKIE_OPTIONS = { ...BASE_COOKIE, maxAge: 15 * 60 * 1000 };
const REFRESH_COOKIE_OPTIONS = { ...BASE_COOKIE, maxAge: 7 * 24 * 60 * 60 * 1000 };

export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  register = async (req, res, next) => {
    try {
      const { accessToken, refreshToken } = await this.authService.register(req.body);
      res
        .cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS)
        .cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
        .status(201)
        .json({ message: 'Registered successfully' });
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
        .clearCookie('refreshToken')
        .json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  };
}
