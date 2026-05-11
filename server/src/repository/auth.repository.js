import { prisma } from '../lib/prisma.js';

export class AuthRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data) {
    return prisma.user.create({ data });
  }
}
