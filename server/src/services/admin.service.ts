import { categoryService } from './category.service';
import { foodDatabaseService } from './foodDatabase.service';

export const adminService = {
  // Category operations
  async getCategories() {
    return await categoryService.getAll();
  },

  async createCategory(name: string) {
    // Check if category already exists
    const existing = await categoryService.findByName(name);
    if (existing) {
      throw new Error('Category already exists');
    }
    return await categoryService.create(name);
  },

  async updateCategory(id: string, name: string) {
    // Check if another category with the same name exists
    const existing = await categoryService.findByName(name);
    if (existing && existing.id !== id) {
      throw new Error('Category with this name already exists');
    }
    return await categoryService.update(id, name);
  },

  async deleteCategory(id: string) {
    return await categoryService.delete(id);
  },

  // Food Database operations
  async getFoodDatabaseItems() {
    return await foodDatabaseService.getAll();
  },

  async createFoodDatabaseItem(data: { name: string; category: string; expirationEstimate: number; imageUrl?: string }) {
    // Check if item already exists
    const existing = await foodDatabaseService.findByName(data.name);
    if (existing) {
      throw new Error('Food item with this name already exists');
    }
    return await foodDatabaseService.create(data);
  },

  async updateFoodDatabaseItem(id: string, data: { name?: string; category?: string; expirationEstimate?: number; imageUrl?: string }) {
    // If name is being updated, check if another item with the same name exists
    if (data.name) {
      const existing = await foodDatabaseService.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new Error('Food item with this name already exists');
      }
    }
    return await foodDatabaseService.update(id, data);
  },

  async deleteFoodDatabaseItem(id: string) {
    return await foodDatabaseService.delete(id);
  }
};

