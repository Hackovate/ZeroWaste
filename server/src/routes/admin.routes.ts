import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getFoodDatabaseItems,
  createFoodDatabaseItem,
  updateFoodDatabaseItem,
  deleteFoodDatabaseItem,
  uploadFoodDatabaseImage,
} from '../controllers/admin.controller';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Category routes
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Food Database routes
router.get('/food-database', getFoodDatabaseItems);
router.post('/food-database', createFoodDatabaseItem);
router.patch('/food-database/:id', updateFoodDatabaseItem);
router.post('/food-database/:id/upload', uploadFoodDatabaseImage);
router.delete('/food-database/:id', deleteFoodDatabaseItem);

export default router;

