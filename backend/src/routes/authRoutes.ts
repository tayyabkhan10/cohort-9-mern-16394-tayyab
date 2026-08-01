import { Router } from 'express';
import * as authController from '../controllers/authController';
import auth from '../middleware/auth';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);
router.post('/google', authController.googleLogin);

export default router;
