import bcrypt from 'bcrypt';
import { AuthRepository } from '../repository/auth.repository.js';
import { generateAccessToken, generateRefreshToken, validateToken, hashToken } from '../helpers/jwt.helper.js';
import { config } from '../config/environment.js';
import BadRequestException from '../exceptions/BadRequestException.js';
import UnauthorizedException from '../exceptions/UnauthorizedException.js';

export class AuthService {
  constructor() {
    this.authRepository = new AuthRepository();
  }

  async register(userData) {
    const existing = await this.authRepository.findByEmail(userData.email);
    if (existing) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await this.authRepository.create({ ...userData, password: hashedPassword });
  }

  async login(credentials) {
    const user = await this.authRepository.findByEmail(credentials.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(credentials.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.#issueTokens(user);
  }

  async refresh(refreshToken) {
    let payload;
    try {
      payload = validateToken(refreshToken, config.jwtRefreshSecret);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.authRepository.findById(payload.id);
    if (!user?.refreshToken) throw new UnauthorizedException('Refresh token not found');

    if (user.refreshToken !== hashToken(refreshToken)) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    return this.#issueTokens(user);
  }

  async logout(userId) {
    await this.authRepository.clearRefreshToken(userId);
  }

  async #issueTokens(user) {
    const payload = { id: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.authRepository.saveRefreshToken(user.id, hashToken(refreshToken));

    return { accessToken, refreshToken };
  }
}
