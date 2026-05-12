import { AuthRepository } from './repository/auth.repository.js';
import { AuthService } from './service/auth.service.js';
import { AuthController } from './controller/auth.controller.js';
import { PersonRepository } from './repository/person.repository.js';
import { PersonService } from './service/person.service.js';
import { PersonController } from './controller/person.controller.js';

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
export const authController = new AuthController(authService);

const personRepository = new PersonRepository();
const personService = new PersonService(personRepository);
export const personController = new PersonController(personService);
