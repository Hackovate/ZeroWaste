import argon2 from 'argon2';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';

export const authService = {
  async register(data: {
    email: string;
    password: string;
    name: string;
    householdSize?: number;
    dietaryPreferences?: string[];
    district?: string;
    division?: string;
  }) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password with Argon2
    const passwordHash = await argon2.hash(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        householdSize: data.householdSize || 1,
        dietaryPreferences: data.dietaryPreferences || [],
        district: data.district,
        division: data.division
      },
      select: {
        id: true,
        email: true,
        name: true,
        householdSize: true,
        dietaryPreferences: true,
        district: true,
        division: true,
        onboardingCompleted: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email });

    return { user, token };
  },

  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await argon2.verify(user.passwordHash, password);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email });

    // Return user without password
    const { passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        householdSize: true,
        dietaryPreferences: true,
        district: true,
        division: true,
        onboardingCompleted: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  async updateProfile(userId: string, data: Partial<{
    name: string;
    householdSize: number;
    dietaryPreferences: string[];
    district: string;
    division: string;
    onboardingCompleted: boolean;
  }>) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        householdSize: true,
        dietaryPreferences: true,
        district: true,
        division: true,
        onboardingCompleted: true,
        updatedAt: true
      }
    });

    return user;
  }
};
