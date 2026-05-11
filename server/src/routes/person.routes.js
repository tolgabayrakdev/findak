import { Router } from 'express';
import { PersonController } from '../controller/person.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createPersonSchema, updatePersonSchema } from '../schemas/person.schema.js';

const router = Router();
const personController = new PersonController();

router.use(authenticate);

router.get('/', personController.getAll);
router.get('/:id', personController.getById);
router.post('/', validate(createPersonSchema), personController.create);
router.put('/:id', validate(updatePersonSchema), personController.update);
router.delete('/:id', personController.delete);

export default router;
