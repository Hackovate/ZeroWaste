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
  },

  // Unit conversion helpers
  convertToBaseUnit(quantity: number, unit: string): number {
    switch (unit.toLowerCase()) {
      case 'kg':
        return quantity * 1000; // Convert to grams
      case 'ltr':
        return quantity * 1000; // Convert to ml (if needed)
      case 'gm':
      case 'ml':
      case 'pcs':
        return quantity;
      default:
        return quantity;
    }
  },

  convertFromBaseUnit(quantity: number, targetUnit: string): number {
    switch (targetUnit.toLowerCase()) {
      case 'kg':
        return quantity / 1000; // Convert from grams
      case 'ltr':
        return quantity / 1000; // Convert from ml (if needed)
      case 'gm':
      case 'ml':
      case 'pcs':
        return quantity;
      default:
        return quantity;
    }
  },

  convertQuantity(quantity: number, fromUnit: string, toUnit: string): number {
    // Convert to base unit first, then to target unit
    const baseQuantity = this.convertToBaseUnit(quantity, fromUnit);
    return this.convertFromBaseUnit(baseQuantity, toUnit);
  },

  // Find matching inventory item by name (case-insensitive, partial match)
  async findMatchingItem(itemName: string, userId: string) {
    const items = await prisma.inventoryItem.findMany({
      where: { userId }
    });

    // Try exact match first (case-insensitive)
    let match = items.find(item => 
      item.name.toLowerCase() === itemName.toLowerCase()
    );

    // If no exact match, try partial match
    if (!match) {
      match = items.find(item => 
        item.name.toLowerCase().includes(itemName.toLowerCase()) ||
        itemName.toLowerCase().includes(item.name.toLowerCase())
      );
    }

    return match || null;
  },

  // Reduce inventory quantity
  async reduceQuantity(id: string, consumedQuantity: number, consumedUnit: string, userId: string) {
    const item = await this.getById(id, userId);
    
    // Convert consumed quantity to match inventory unit
    const convertedQuantity = this.convertQuantity(consumedQuantity, consumedUnit, item.unit);
    
    // Calculate new quantity
    const newQuantity = Math.max(0, item.quantity - convertedQuantity);
    
    // Update inventory
    return await prisma.inventoryItem.update({
      where: { id },
      data: { quantity: newQuantity }
    });
  },

  // Restore inventory quantity
  async restoreQuantity(id: string, restoredQuantity: number, restoredUnit: string, userId: string) {
    const item = await this.getById(id, userId);
    
    // Convert restored quantity to match inventory unit
    const convertedQuantity = this.convertQuantity(restoredQuantity, restoredUnit, item.unit);
    
    // Calculate new quantity
    const newQuantity = item.quantity + convertedQuantity;
    
    // Update inventory
    return await prisma.inventoryItem.update({
      where: { id },
      data: { quantity: newQuantity }
    });
  }
};
