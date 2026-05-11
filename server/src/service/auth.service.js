import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repository/auth.repository.js';
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
    const user = await this.authRepository.create({ ...userData, password: hashedPassword });

    return jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, { expiresIn: '7d' });
  }

  async login(credentials) {
    const user = await this.authRepository.findByEmail(credentials.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(credentials.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, { expiresIn: '7d' });
  }
}
