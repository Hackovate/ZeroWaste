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
  budgetPreference: z.enum(['low', 'medium', 'high', 'premium']).optional(),
  monthlyBudget: z.number().min(0).optional(),
  district: z.string().optional(),
  division: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  onboardingCompleted: z.boolean().optional(),
  familyMembers: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    age: z.number().int().min(0).max(120).optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
    healthConditions: z.array(z.string()).optional(),
    imageUrl: z.string().url().optional().nullable(),
  })).optional(),
});
