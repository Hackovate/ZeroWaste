import { Router } from 'express';
import { getFoodDatabase, searchFoodDatabase } from '../controllers/foodDatabase.controller';

const router = Router();

// Public routes - no authentication required (reference data)
router.get('/', getFoodDatabase);
router.get('/search', searchFoodDatabase);

export default router;

