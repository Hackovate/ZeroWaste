import { Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service';
import { imagekitService } from '../services/imagekit.service';
import { AuthRequest } from '../middleware/auth';

export const getInventory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const inventory = await inventoryService.getAll(req.user!.id);
    res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await inventoryService.getById(req.params.id, req.user!.id);
    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Inventory item not found') {
      res.status(404).json({ 
        success: false,
        error: error.message 
      });
      return;
    }
    next(error);
  }
};

export const createInventoryItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await inventoryService.create(req.body, req.user!.id);
    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInventoryItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await inventoryService.update(req.params.id, req.body, req.user!.id);
    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Inventory item not found') {
      res.status(404).json({ 
        success: false,
        error: error.message 
      });
      return;
    }
    next(error);
  }
};

export const deleteInventoryItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await inventoryService.delete(req.params.id, req.user!.id);
    res.json({
      success: true,
      message: 'Inventory item deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Inventory item not found') {
      res.status(404).json({ 
        success: false,
        error: error.message 
      });
      return;
    }
    next(error);
  }
};

export const getInventoryByCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const items = await inventoryService.getByCategory(req.params.category, req.user!.id);
    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const inventory = await inventoryService.getAll(req.user!.id);

    const totalItems = inventory.length;
    const categoryBreakdown = inventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const expiringItems = inventory.filter(
      (item) => item.expirationEstimate <= 7
    );

    res.json({
      success: true,
      data: {
        totalItems,
        categoryBreakdown,
        expiringItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadInventoryImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const imageUrl = await imagekitService.uploadImage(req, req.user!.id);

    res.json({
      success: true,
      data: { imageUrl },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
};
