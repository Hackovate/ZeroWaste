import prisma from '../config/database';

const FOOD_CATEGORIES = [
  'dairy',
  'grain',
  'fruit',
  'vegetable',
  'protein',
  'oil',
];

/**
 * Seeds categories into the database if they don't already exist.
 * This is idempotent - it only seeds if the database is empty.
 */
export async function seedCategories(): Promise<void> {
  try {
    // Check if categories already exist
    const existingCount = await prisma.category.count();
    
    if (existingCount > 0) {
      console.log(`Categories already exist (${existingCount} found). Skipping seed.`);
      return;
    }

    // Insert categories
    await prisma.category.createMany({
      data: FOOD_CATEGORIES.map(category => ({
        name: category
      }))
    });

    console.log(`Successfully seeded ${FOOD_CATEGORIES.length} categories.`);
  } catch (error) {
    console.error('Error seeding categories:', error);
    // Don't throw - allow seeding to continue even if this fails
  }
}

