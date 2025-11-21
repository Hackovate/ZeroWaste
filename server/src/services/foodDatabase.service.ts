import prisma from '../config/database';

export const foodDatabaseService = {
  async getAll() {
    return await prisma.foodDatabase.findMany({
      orderBy: { name: 'asc' }
    });
  },

  async search(query: string) {
    const searchTerm = query.toLowerCase().trim();
    return await prisma.foodDatabase.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { category: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      orderBy: { name: 'asc' }
    });
  },

  async findByName(name: string) {
    const normalized = name.trim().toLowerCase();
    return await prisma.foodDatabase.findFirst({
      where: {
        name: { equals: normalized, mode: 'insensitive' }
      }
    });
  },

  async create(data: { name: string; category: string; expirationEstimate: number; imageUrl?: string }) {
    return await prisma.foodDatabase.create({
      data: {
        name: data.name.trim(),
        category: data.category.toLowerCase().trim(),
        expirationEstimate: data.expirationEstimate,
        imageUrl: data.imageUrl
      }
    });
  },

  async update(id: string, data: { name?: string; category?: string; expirationEstimate?: number; imageUrl?: string }) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.category !== undefined) updateData.category = data.category.toLowerCase().trim();
    if (data.expirationEstimate !== undefined) updateData.expirationEstimate = data.expirationEstimate;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

    return await prisma.foodDatabase.update({
      where: { id },
      data: updateData
    });
  },

  async delete(id: string) {
    return await prisma.foodDatabase.delete({
      where: { id }
    });
  },

  async findById(id: string) {
    return await prisma.foodDatabase.findUnique({
      where: { id }
    });
  }
};

