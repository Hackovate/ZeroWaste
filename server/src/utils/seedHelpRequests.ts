import prisma from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

interface HelpRequestSeed {
  title: string;
  description: string;
  category: string;
  quantity?: number;
  unit?: string;
  district: string;
  division: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  neededBy: string;
  status: string;
}

/**
 * Seeds help requests into the database if they don't already exist.
 * Creates a default user for seeding if no users exist.
 */
export async function seedHelpRequests(): Promise<void> {
  try {
    // Check if help requests already exist
    const existingCount = await prisma.helpRequest.count();
    
    if (existingCount > 0) {
      console.log(`Help requests already exist (${existingCount} found). Skipping seed.`);
      return;
    }

    // Get or create a default user for help requests
    let defaultUser = await prisma.user.findFirst({
      where: { role: 'user' }
    });

    if (!defaultUser) {
      // Create a default user if none exists
      const argon2 = require('argon2');
      const passwordHash = await argon2.hash('password123');
      defaultUser = await prisma.user.create({
        data: {
          email: 'community@zerowaste.com',
          passwordHash,
          name: 'Community User',
          role: 'user',
          district: 'Dhaka',
          division: 'Dhaka'
        }
      });
      console.log('Created default user for help requests');
    }

    // Read seed file
    const projectRoot = process.cwd();
    const seedFilePath = path.join(projectRoot, 'prisma', 'helpRequests.seed.json');
    const seedFileContent = fs.readFileSync(seedFilePath, 'utf-8');
    const helpRequests: HelpRequestSeed[] = JSON.parse(seedFileContent);

    // Create help requests
    const createdRequests = await Promise.all(
      helpRequests.map(async (request) => {
        return prisma.helpRequest.create({
          data: {
            title: request.title,
            description: request.description,
            category: request.category,
            quantity: request.quantity,
            unit: request.unit,
            district: request.district,
            division: request.division,
            contactName: request.contactName,
            contactEmail: request.contactEmail,
            contactPhone: request.contactPhone,
            neededBy: new Date(request.neededBy),
            status: request.status,
            userId: defaultUser.id
          }
        });
      })
    );

    console.log(`Successfully seeded ${createdRequests.length} help requests.`);
  } catch (error) {
    console.error('Error seeding help requests:', error);
    // Don't throw - allow seeding to continue even if this fails
  }
}
