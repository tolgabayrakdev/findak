import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/environment.js';

export function generateAccessToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '15m' });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: '7d' });
}

export function validateToken(token, secret) {
  return jwt.verify(token, secret);
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
