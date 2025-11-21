import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing resource categories...');
  
  // Update all resources to use lowercase categories
  const updates = [
    { from: 'Waste Reduction', to: 'waste reduction' },
    { from: 'Meal Planning', to: 'meal planning' },
    { from: 'Nutrition Tips', to: 'nutrition tips' },
    { from: 'Budget Tips', to: 'budget meal tips' },
  ];

  for (const update of updates) {
    const result = await prisma.resource.updateMany({
      where: { category: update.from },
      data: { category: update.to }
    });
    console.log(`Updated ${result.count} resources from "${update.from}" to "${update.to}"`);
  }

  console.log('Resource categories fixed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

