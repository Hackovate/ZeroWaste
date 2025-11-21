import prisma from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

interface InventorySeed {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expirationEstimate: number;
  price: number;
}

/**
 * Seeds default inventory items for a new user.
 * @param userId - The ID of the user to seed inventory for
 */
export async function seedInventory(userId: string): Promise<void> {
  try {
    // Read seed file - resolve from project root to work in both dev and production
    const projectRoot = process.cwd();
    const seedFilePath = path.join(projectRoot, 'prisma', 'inventory.seed.json');
    const seedFileContent = fs.readFileSync(seedFilePath, 'utf-8');
    const inventoryItems: InventorySeed[] = JSON.parse(seedFileContent);

    // Create inventory items for the user
    await prisma.inventoryItem.createMany({
      data: inventoryItems.map(item => ({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        expirationEstimate: item.expirationEstimate,
        price: item.price,
        userId: userId
      }))
    });

    console.log(`Successfully seeded ${inventoryItems.length} inventory items for user ${userId}.`);
  } catch (error) {
    console.error('Error seeding inventory:', error);
    // Don't throw - allow registration to continue even if seeding fails
  }
}

