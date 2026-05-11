import { Router } from 'express';
import PersonController from '../controller/person.controller.js';

const router = Router();
const personController = new PersonController();

router.get('/', (req, res) => personController.getAll(req, res));
router.get('/:id', (req, res) => personController.getById(req, res));
router.post('/', (req, res) => personController.create(req, res));
router.put('/:id', (req, res) => personController.update(req, res));
router.delete('/:id', (req, res) => personController.delete(req, res));

export default router;
