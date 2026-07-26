import { Router } from 'express';
import * as notesController from '../controllers/notesController';
import auth from '../middleware/auth';

const router = Router();

router.use(auth);
router.get('/', notesController.getNotes);
router.get('/:id', notesController.getNote);
router.post('/', notesController.createNote);
router.put('/:id', notesController.updateNote);
router.delete('/:id', notesController.deleteNote);

export default router;
