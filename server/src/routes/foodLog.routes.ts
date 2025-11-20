import { Router } from 'express';
import {
  getFoodLogs,
  getFoodLog,
  createFoodLog,
  deleteFoodLog,
  uploadFoodImage,
} from '../controllers/foodLog.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createFoodLogSchema } from '../validators/foodLog.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getFoodLogs);
router.get('/:id', getFoodLog);
router.post('/', validateRequest(createFoodLogSchema), createFoodLog);
router.post('/upload', uploadFoodImage);
router.delete('/:id', deleteFoodLog);

export default router;
