import prisma from '../config/database';

export const inventoryService = {
  async getAll(userId: string) {
    return await prisma.inventoryItem.findMany({
      where: { userId },
      orderBy: { dateAdded: 'desc' }
    });
  },

  async getById(id: string, userId: string) {
    const item = await prisma.inventoryItem.findFirst({
      where: { id, userId }
    });

    if (!item) {
      throw new Error('Inventory item not found');
    }

    return item;
  },

  async create(data: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expirationEstimate: number;
    price?: number;
    imageUrl?: string;
  }, userId: string) {
    return await prisma.inventoryItem.create({
      data: {
        ...data,
        userId
      }
    });
  },

  async update(id: string, data: Partial<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expirationEstimate: number;
    price: number;
    imageUrl: string;
  }>, userId: string) {
    // Verify ownership
    await this.getById(id, userId);

    return await prisma.inventoryItem.update({
      where: { id },
      data
    });
  },

  async delete(id: string, userId: string) {
    // Verify ownership
    await this.getById(id, userId);

    return await prisma.inventoryItem.delete({
      where: { id }
    });
  },

  async getByCategory(category: string, userId: string) {
    return await prisma.inventoryItem.findMany({
      where: { userId, category },
      orderBy: { dateAdded: 'desc' }
    });
  }
};
