import { Router } from 'express';
import { getCategories } from '../controllers/category.controller';

const router = Router();

// Public route - no authentication required
router.get('/', getCategories);

export default router;

