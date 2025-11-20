import { z } from 'zod';

export const createFoodLogSchema = z.object({
  itemName: z.string().min(1, 'Item name is required').max(100),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.enum(['kg', 'gm', 'ltr', 'pcs'], {
    errorMap: () => ({ message: 'Invalid unit' }),
  }),
  category: z.string().min(1, 'Category is required'),
  date: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
});

export const updateFoodLogSchema = z.object({
  itemName: z.string().min(1).max(100).optional(),
  quantity: z.number().positive().optional(),
  unit: z.enum(['kg', 'gm', 'ltr', 'pcs']).optional(),
  category: z.string().optional(),
  date: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
});
