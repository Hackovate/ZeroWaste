import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding resources...');
  
  // Read resources from JSON file
  const resourcesPath = path.join(__dirname, 'resources.seed.json');
  const resourcesContent = fs.readFileSync(resourcesPath, 'utf-8');
  const resources = JSON.parse(resourcesContent);
  
  // Clear existing resources
  await prisma.resource.deleteMany({});
  
  // Insert new resources
  for (const resource of resources) {
    await prisma.resource.create({
      data: resource
    });
  }
  
  console.log(`Seeded ${resources.length} resources`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

