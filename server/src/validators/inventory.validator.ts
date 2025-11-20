import { z } from 'zod';

export const createItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.enum(['dairy', 'grain', 'fruit', 'vegetable', 'protein', 'oil'], {
    errorMap: () => ({ message: 'Invalid category' }),
  }),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.enum(['kg', 'gm', 'ltr', 'pcs'], {
    errorMap: () => ({ message: 'Invalid unit' }),
  }),
  expirationEstimate: z.number().int().positive('Expiration estimate must be positive'),
  price: z.number().nonnegative().optional(),
  imageUrl: z.string().optional().nullable(),
});

export const updateItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.enum(['dairy', 'grain', 'fruit', 'vegetable', 'protein', 'oil']).optional(),
  quantity: z.number().positive().optional(),
  unit: z.enum(['kg', 'gm', 'ltr', 'pcs']).optional(),
  expirationEstimate: z.number().int().positive().optional(),
  price: z.number().nonnegative().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});
