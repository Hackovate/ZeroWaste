import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { adminService } from '../services/admin.service';
import { imagekitService } from '../services/imagekit.service';
import { foodDatabaseService } from '../services/foodDatabase.service';

// Category operations
export const getCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await adminService.getCategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required',
      });
    }

    const category = await adminService.createCategory(name);
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    if (error.message === 'Category already exists') {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
};

export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required',
      });
    }

    const category = await adminService.updateCategory(id, name);
    res.json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    if (error.message === 'Category with this name already exists') {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await adminService.deleteCategory(id);
    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Food Database operations
export const getFoodDatabaseItems = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const items = await adminService.getFoodDatabaseItems();
    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

export const createFoodDatabaseItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, category, expirationEstimate, imageUrl } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Food item name is required',
      });
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Category is required',
      });
    }

    if (!expirationEstimate || typeof expirationEstimate !== 'number' || expirationEstimate <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Expiration estimate must be a positive number',
      });
    }

    const item = await adminService.createFoodDatabaseItem({
      name,
      category,
      expirationEstimate,
      imageUrl: imageUrl || undefined,
    });

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    if (error.message === 'Food item with this name already exists') {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
};

export const updateFoodDatabaseItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, category, expirationEstimate, imageUrl } = req.body;

    const updateData: any = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Food item name must be a non-empty string',
        });
      }
      updateData.name = name;
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Category must be a non-empty string',
        });
      }
      updateData.category = category;
    }

    if (expirationEstimate !== undefined) {
      if (typeof expirationEstimate !== 'number' || expirationEstimate <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Expiration estimate must be a positive number',
        });
      }
      updateData.expirationEstimate = expirationEstimate;
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl || null;
    }

    const item = await adminService.updateFoodDatabaseItem(id, updateData);
    res.json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    if (error.message === 'Food item with this name already exists') {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
};

export const deleteFoodDatabaseItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    // Get item to delete image if exists
    const item = await foodDatabaseService.findById(id);
    if (item?.imageUrl) {
      await imagekitService.deleteImage(item.imageUrl);
    }
    await adminService.deleteFoodDatabaseItem(id);
    res.json({
      success: true,
      message: 'Food database item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const uploadFoodDatabaseImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Verify item exists
    const item = await foodDatabaseService.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Food database item not found',
      });
    }

    // Delete old image if exists
    if (item.imageUrl) {
      await imagekitService.deleteImage(item.imageUrl);
    }

    // Upload new image
    const imageUrl = await imagekitService.uploadImage(req, req.user!.id);

    // Update item with new image URL
    const updatedItem = await adminService.updateFoodDatabaseItem(id, { imageUrl });

    res.json({
      success: true,
      data: { imageUrl: updatedItem.imageUrl },
    });
  } catch (error: any) {
    if (error.message === 'No image file provided' || error.message === 'Failed to parse form data') {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
};

