import argon2 from 'argon2';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { seedResources } from '../utils/seedResources';
import { seedInventory } from '../utils/seedInventory';

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

    // Seed resources and inventory for new user
    // Run seeding synchronously to ensure data is available immediately after registration
    try {
      await seedResources();
    } catch (err) {
      console.error('Failed to seed resources:', err);
      // Continue even if seeding fails
    }

    try {
      await seedInventory(user.id);
    } catch (err) {
      console.error('Failed to seed inventory:', err);
      // Continue even if seeding fails
    }

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
        budgetPreference: true,
        monthlyBudget: true,
        district: true,
        division: true,
        imageUrl: true,
        onboardingCompleted: true,
        createdAt: true,
        updatedAt: true,
        familyMembers: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            healthConditions: true,
            imageUrl: true
          }
        }
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
    budgetPreference: string;
    monthlyBudget: number;
    district: string;
    division: string;
    imageUrl: string;
    onboardingCompleted: boolean;
    familyMembers?: Array<{
      id?: string;
      name: string;
      age?: number;
      gender?: string;
      healthConditions?: string[];
      imageUrl?: string;
    }>;
  }>) {
    const { familyMembers, ...userData } = data;

    // Update user data
    const user = await prisma.user.update({
      where: { id: userId },
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        householdSize: true,
        dietaryPreferences: true,
        budgetPreference: true,
        monthlyBudget: true,
        district: true,
        division: true,
        onboardingCompleted: true,
        updatedAt: true
      }
    });

    // Handle family members if provided
    if (familyMembers !== undefined) {
      // Delete existing family members
      await prisma.familyMember.deleteMany({
        where: { userId }
      });

      // Create new family members
      if (familyMembers.length > 0) {
        await prisma.familyMember.createMany({
          data: familyMembers.map(member => ({
            name: member.name,
            age: member.age,
            gender: member.gender,
            healthConditions: member.healthConditions || [],
            imageUrl: member.imageUrl,
            userId
          }))
        });
      }
    }

    // Fetch updated user with family members
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        householdSize: true,
        dietaryPreferences: true,
        budgetPreference: true,
        monthlyBudget: true,
        district: true,
        division: true,
        imageUrl: true,
        onboardingCompleted: true,
        updatedAt: true,
        familyMembers: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            healthConditions: true,
            imageUrl: true
          }
        }
      }
    });

    return updatedUser;
  }
};
