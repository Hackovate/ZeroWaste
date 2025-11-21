import { z } from 'zod';

export const createHelpRequestSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  category: z.string().min(1),
  quantity: z.number().positive().optional(),
  unit: z.enum(['kg', 'gm', 'ltr', 'pcs']).optional(),
  district: z.string().optional(), // Optional, will use user's district if not provided
  division: z.string().optional(), // Optional, will use user's division if not provided
  contactName: z.string().min(1),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  neededBy: z.string().optional() // ISO date string, optional
});

export const updateHelpRequestSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(2000).optional(),
  category: z.string().min(1).optional(),
  quantity: z.number().positive().optional(),
  unit: z.enum(['kg', 'gm', 'ltr', 'pcs']).optional(),
  contactName: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  neededBy: z.string().datetime().optional(),
  status: z.enum(['open', 'fulfilled', 'closed']).optional()
});

export const createDonationSchema = z.object({
  helpRequestId: z.string().cuid(),
  message: z.string().max(500).optional(),
  quantity: z.number().positive().optional(),
  unit: z.enum(['kg', 'gm', 'ltr', 'pcs']).optional(),
  contactInfo: z.string().max(200).optional(),
  anonymous: z.boolean().default(false)
});

export const createReportSchema = z.object({
  helpRequestId: z.string().cuid(),
  type: z.enum(['fraud', 'trusted']),
  reason: z.string().max(500).optional()
});
