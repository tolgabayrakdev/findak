import prisma from '../lib/prisma.js';

export default class PersonRepository {
  async findAll(userId) {
    return prisma.person.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id, userId) {
    return prisma.person.findFirst({
      where: { id, userId },
    });
  }

  async create(data) {
    return prisma.person.create({ data });
  }

  async update(id, userId, data) {
    return prisma.person.updateMany({
      where: { id, userId },
      data,
    });
  }

  async delete(id, userId) {
    return prisma.person.deleteMany({
      where: { id, userId },
    });
  }
}
