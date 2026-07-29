import { Router } from 'express';
import * as folderController from '../controllers/folderController';
import auth from '../middleware/auth';

const router = Router();

router.use(auth);
router.get('/', folderController.getFolders);
router.post('/', folderController.createFolder);
router.put('/:id', folderController.updateFolder);
router.delete('/:id', folderController.deleteFolder);

export default router;