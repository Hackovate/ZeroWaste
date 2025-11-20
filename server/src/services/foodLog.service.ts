import prisma from '../config/database';
import { inventoryService } from './inventory.service';

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
    // Create the food log
    const foodLog = await prisma.foodLog.create({
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

    // Try to find matching inventory item and reduce quantity
    try {
      const matchingItem = await inventoryService.findMatchingItem(data.itemName, userId);
      
      if (matchingItem) {
        // Check if we can convert units (same base unit type)
        const canConvert = this.canConvertUnits(data.unit, matchingItem.unit);
        
        if (canConvert) {
          // Reduce inventory quantity
          await inventoryService.reduceQuantity(
            matchingItem.id,
            data.quantity,
            data.unit,
            userId
          );
        } else if (data.unit === matchingItem.unit) {
          // Same unit, no conversion needed
          await inventoryService.reduceQuantity(
            matchingItem.id,
            data.quantity,
            data.unit,
            userId
          );
        }
        // If units can't be converted (e.g., pcs vs kg), skip inventory reduction
      }
    } catch (error) {
      // Don't fail food log creation if inventory update fails
      console.error('Error updating inventory:', error);
    }

    return foodLog;
  },

  // Helper to check if units can be converted
  canConvertUnits(unit1: string, unit2: string): boolean {
    const weightUnits = ['kg', 'gm'];
    const volumeUnits = ['ltr', 'ml'];
    const pieceUnits = ['pcs'];

    const u1 = unit1.toLowerCase();
    const u2 = unit2.toLowerCase();

    // Same unit
    if (u1 === u2) return true;

    // Both are weight units
    if (weightUnits.includes(u1) && weightUnits.includes(u2)) return true;

    // Both are volume units
    if (volumeUnits.includes(u1) && volumeUnits.includes(u2)) return true;

    // Both are piece units
    if (pieceUnits.includes(u1) && pieceUnits.includes(u2)) return true;

    return false;
  },

  async delete(id: string, userId: string) {
    // Get the food log before deleting
    const foodLog = await this.getById(id, userId);

    // Delete the food log
    await prisma.foodLog.delete({
      where: { id }
    });

    // Try to restore inventory quantity
    try {
      const matchingItem = await inventoryService.findMatchingItem(foodLog.itemName, userId);
      
      if (matchingItem) {
        // Check if we can convert units
        const canConvert = this.canConvertUnits(foodLog.unit, matchingItem.unit);
        
        if (canConvert) {
          // Restore inventory quantity
          await inventoryService.restoreQuantity(
            matchingItem.id,
            foodLog.quantity,
            foodLog.unit,
            userId
          );
        } else if (foodLog.unit === matchingItem.unit) {
          // Same unit, no conversion needed
          await inventoryService.restoreQuantity(
            matchingItem.id,
            foodLog.quantity,
            foodLog.unit,
            userId
          );
        }
      }
    } catch (error) {
      // Don't fail deletion if inventory update fails
      console.error('Error restoring inventory:', error);
    }

    return foodLog;
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
