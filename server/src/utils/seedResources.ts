import prisma from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

interface ResourceSeed {
  title: string;
  description: string;
  url: string;
  category: string;
  type: string;
}

/**
 * Seeds resources into the database if they don't already exist.
 * This is idempotent - it only seeds if the database is empty.
 */
export async function seedResources(): Promise<void> {
  try {
    // Check if resources already exist
    const existingCount = await prisma.resource.count();
    
    if (existingCount > 0) {
      console.log(`Resources already exist (${existingCount} found). Skipping seed.`);
      return;
    }

    // Read seed file - resolve from project root to work in both dev and production
    const projectRoot = process.cwd();
    const seedFilePath = path.join(projectRoot, 'prisma', 'resources.seed.json');
    const seedFileContent = fs.readFileSync(seedFilePath, 'utf-8');
    const resources: ResourceSeed[] = JSON.parse(seedFileContent);

    // Insert resources - normalize categories to lowercase
    await prisma.resource.createMany({
      data: resources.map(resource => ({
        title: resource.title,
        description: resource.description,
        url: resource.url,
        category: resource.category.toLowerCase(),
        type: resource.type
      }))
    });

    console.log(`Successfully seeded ${resources.length} resources.`);
  } catch (error) {
    console.error('Error seeding resources:', error);
    // Don't throw - allow registration to continue even if seeding fails
  }
}

