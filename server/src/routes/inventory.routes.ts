import { Router } from 'express';
import {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryByCategory,
  getInventoryStats,
  uploadInventoryImage,
} from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createItemSchema, updateItemSchema } from '../validators/inventory.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getInventory);
router.get('/stats', getInventoryStats);
router.get('/category/:category', getInventoryByCategory);
router.get('/:id', getInventoryItem);
router.post('/', validateRequest(createItemSchema), createInventoryItem);
router.post('/upload', uploadInventoryImage);
router.patch('/:id', validateRequest(updateItemSchema), updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

export default router;
