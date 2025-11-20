import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { updateProfileSchema } from '../validators/auth.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.patch('/profile', validateRequest(updateProfileSchema), updateProfile);

export default router;
