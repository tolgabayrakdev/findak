import { prisma } from '../lib/prisma.js';

export class AuthRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data) {
    return prisma.user.create({ data });
  }

  async saveRefreshToken(userId, hashedToken) {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedToken },
    });
  }

  async clearRefreshToken(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}
