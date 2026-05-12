import PersonRepository from '../repository/person.repository.js';
import NotFoundException from '../exceptions/NotFoundException.js';

export default class PersonService {
  constructor() {
    this.personRepository = new PersonRepository();
  }

  async getAll(userId) {
    const persons = await this.personRepository.findAll(userId);
    return persons.map(({ userId: _, ...person }) => person);
  }

  async getById(id, userId) {
    const person = await this.personRepository.findById(id, userId);
    if (!person) throw new NotFoundException('Person not found');
    const { userId: _, ...rest } = person;
    return rest;
  }

  async create(userId, personData) {
    const { userId: _, ...person } = await this.personRepository.create({ ...personData, userId });
    return person;
  }

  async update(id, userId, personData) {
    const person = await this.personRepository.update(id, userId, personData);
    if (!person) throw new NotFoundException('Person not found');
    const { userId: _, ...rest } = person;
    return rest;
  }

  async delete(id, userId) {
    await this.getById(id, userId);
    await this.personRepository.delete(id, userId);
  }
}
