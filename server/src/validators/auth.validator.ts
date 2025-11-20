import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100),
  householdSize: z.number().int().min(1).max(20).default(1),
  dietaryPreferences: z.array(z.string()).default([]),
  district: z.string().optional(),
  division: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  householdSize: z.number().int().min(1).max(20).optional(),
  dietaryPreferences: z.array(z.string()).optional(),
  district: z.string().optional(),
  division: z.string().optional(),
  onboardingCompleted: z.boolean().optional(),
});
