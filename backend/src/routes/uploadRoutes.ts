import { Router } from 'express';
import multer from 'multer';
import * as uploadController from '../controllers/uploadController';
import auth from '../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

const router = Router();

router.use(auth);
router.post('/', upload.single('image'), uploadController.uploadImage);

export default router;