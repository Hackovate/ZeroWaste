import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, validateRequest(updateProfileSchema), updateProfile);

export default router;
