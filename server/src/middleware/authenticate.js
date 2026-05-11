import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import UnauthorizedException from '../exceptions/UnauthorizedException.js';

export function authenticate(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) throw new UnauthorizedException('No token provided');

    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof UnauthorizedException) return next(err);
    next(new UnauthorizedException('Invalid or expired token'));
  }
}
