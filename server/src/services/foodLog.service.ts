import prisma from '../config/database';

export const foodLogService = {
  async getAll(userId: string) {
    return await prisma.foodLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });
  },

  async getById(id: string, userId: string) {
    const log = await prisma.foodLog.findFirst({
      where: { id, userId }
    });

    if (!log) {
      throw new Error('Food log not found');
    }

    return log;
  },

  async create(data: {
    itemName: string;
    quantity: number;
    unit: string;
    category: string;
    date?: string;
    imageUrl?: string;
  }, userId: string) {
    return await prisma.foodLog.create({
      data: {
        itemName: data.itemName,
        quantity: data.quantity,
        unit: data.unit,
        category: data.category,
        date: data.date ? new Date(data.date) : new Date(),
        imageUrl: data.imageUrl,
        userId
      }
    });
  },

  async delete(id: string, userId: string) {
    // Verify ownership
    await this.getById(id, userId);

    return await prisma.foodLog.delete({
      where: { id }
    });
  },

  async getByDateRange(startDate: Date, endDate: Date, userId: string) {
    return await prisma.foodLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'desc' }
    });
  }
};
