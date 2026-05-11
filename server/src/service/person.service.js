import PersonRepository from '../repository/person.repository.js';
import NotFoundException from '../exceptions/NotFoundException.js';

export default class PersonService {
  constructor() {
    this.personRepository = new PersonRepository();
  }

  async getAll(userId) {
    return this.personRepository.findAll(userId);
  }

  async getById(id, userId) {
    const person = await this.personRepository.findById(id, userId);
    if (!person) throw new NotFoundException('Person not found');
    return person;
  }

  async create(userId, body) {
    const { firstName, lastName, phone } = body;
    return this.personRepository.create({ firstName, lastName, phone, userId });
  }

  async update(id, userId, body) {
    await this.getById(id, userId);
    const { firstName, lastName, phone } = body;
    await this.personRepository.update(id, userId, { firstName, lastName, phone });
    return this.personRepository.findById(id, userId);
  }

  async delete(id, userId) {
    await this.getById(id, userId);
    await this.personRepository.delete(id, userId);
  }
}
