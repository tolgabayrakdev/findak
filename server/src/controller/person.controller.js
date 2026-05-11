import PersonService from '../service/person.service.js';

export default class PersonController {
  constructor() {
    this.personService = new PersonService();
  }

  async getAll(req, res, next) {
    try {
      const persons = await this.personService.getAll(req.user.id);
      res.json(persons);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const person = await this.personService.getById(req.params.id, req.user.id);
      res.json(person);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const person = await this.personService.create(req.user.id, req.body);
      res.status(201).json(person);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const person = await this.personService.update(req.params.id, req.user.id, req.body);
      res.json(person);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await this.personService.delete(req.params.id, req.user.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
