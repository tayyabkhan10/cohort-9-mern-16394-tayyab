import { Router } from 'express';
import * as authController from '../controllers/authController';
import auth from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);
router.post('/google', authController.googleLogin);
router.patch('/me', auth, authController.updateProfile);
router.delete('/me/avatar', auth, authController.removeAvatar);
router.post('/me/avatar', auth, upload.single('avatar'), authController.uploadAvatar);

export default router;
