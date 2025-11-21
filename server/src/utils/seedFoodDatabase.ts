import prisma from '../config/database';
import * as fs from 'fs';
import * as path from 'path';
import { imagekitService } from '../services/imagekit.service';

interface FoodDatabaseSeed {
  name: string;
  category: string;
  expirationEstimate: number;
}

/**
 * Seeds food database items into the database if they don't already exist.
 * This is idempotent - it only seeds if the database is empty.
 * Uploads images from assets folder to ImageKit and stores URLs.
 */
export async function seedFoodDatabase(): Promise<void> {
  try {
    // Check if food database items already exist
    const existingCount = await prisma.foodDatabase.count();
    
    if (existingCount > 0) {
      console.log(`Food database items already exist (${existingCount} found). Skipping seed.`);
      return;
    }

    // Read seed file - resolve from project root to work in both dev and production
    const projectRoot = process.cwd();
    const seedFilePath = path.join(projectRoot, 'prisma', 'foodDatabase.seed.json');
    const seedFileContent = fs.readFileSync(seedFilePath, 'utf-8');
    const foodItems: FoodDatabaseSeed[] = JSON.parse(seedFileContent);

    // Read images from assets folder (relative to server directory)
    const imagesPath = path.join(projectRoot, '..', 'client', 'public', 'assets', 'food_database');
    let imageFiles: string[] = [];
    
    if (fs.existsSync(imagesPath)) {
      imageFiles = fs.readdirSync(imagesPath)
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .sort(); // Sort to ensure consistent order
    }

    console.log(`Found ${imageFiles.length} images in assets folder`);

    // Upload images and create food database items
    const itemsToCreate = await Promise.all(
      foodItems.map(async (item) => {
        let imageUrl: string | undefined = undefined;

        // Match image by name (e.g., "apple.jpg" matches item named "Apple")
        const normalizedItemName = item.name.toLowerCase().replace(/\s+/g, '-');
        const matchingImage = imageFiles.find(file => {
          const fileNameWithoutExt = file.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '').toLowerCase();
          return fileNameWithoutExt === normalizedItemName || fileNameWithoutExt.includes(normalizedItemName);
        });

        if (matchingImage) {
          try {
            const imagePath = path.join(imagesPath, matchingImage);
            const fileName = `food-db-${normalizedItemName}-${Date.now()}`;
            imageUrl = await imagekitService.uploadImageFromPath(imagePath, fileName);
            console.log(`Uploaded image for ${item.name}: ${imageUrl}`);
          } catch (error) {
            console.warn(`Failed to upload image for ${item.name}:`, error);
            // Continue without image if upload fails
          }
        } else {
          console.log(`No matching image found for ${item.name}`);
        }

        return {
          name: item.name,
          category: item.category,
          expirationEstimate: item.expirationEstimate,
          imageUrl
        };
      })
    );

    // Insert food database items
    await prisma.foodDatabase.createMany({
      data: itemsToCreate
    });

    console.log(`Successfully seeded ${foodItems.length} food database items with ${itemsToCreate.filter(i => i.imageUrl).length} images.`);
  } catch (error) {
    console.error('Error seeding food database:', error);
    // Don't throw - allow seeding to continue even if this fails
  }
}

