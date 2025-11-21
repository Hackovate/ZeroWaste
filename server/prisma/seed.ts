import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { seedResources } from '../src/utils/seedResources';
import { seedCategories } from '../src/utils/seedCategories';
import { seedFoodDatabase } from '../src/utils/seedFoodDatabase';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create admin user if it doesn't exist
  console.log('Creating admin user...');
  const adminEmail = 'admin@mail.com';
  const adminPassword = 'admin123';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const passwordHash = await argon2.hash(adminPassword);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'Admin',
        role: 'admin'
      }
    });
    console.log('Admin user created successfully');
  } else {
    // Update existing admin user to ensure role is set
    if (existingAdmin.role !== 'admin') {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { role: 'admin' }
      });
      console.log('Existing user updated to admin role');
    } else {
      console.log('Admin user already exists');
    }
  }

  // Seed categories (idempotent - only seeds if empty)
  await seedCategories();

  // Seed resources (idempotent - only seeds if empty)
  await seedResources();

  // Seed food database (idempotent - only seeds if empty)
  await seedFoodDatabase();

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

