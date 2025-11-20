import { Response, NextFunction } from 'express';
import { foodLogService } from '../services/foodLog.service';
import { imagekitService } from '../services/imagekit.service';
import { AuthRequest } from '../middleware/auth';

export const getFoodLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const foodLogs = await foodLogService.getAll(req.user!.id);
    res.json({
      success: true,
      data: foodLogs,
    });
  } catch (error) {
    next(error);
  }
};

export const getFoodLog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const log = await foodLogService.getById(req.params.id, req.user!.id);
    res.json({
      success: true,
      data: log,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Food log not found') {
      res.status(404).json({ 
        success: false,
        error: error.message 
      });
      return;
    }
    next(error);
  }
};

export const createFoodLog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const foodLog = await foodLogService.create(req.body, req.user!.id);
    res.status(201).json({
      success: true,
      data: foodLog,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFoodLog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await foodLogService.delete(req.params.id, req.user!.id);
    res.json({
      success: true,
      message: 'Food log deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Food log not found') {
      res.status(404).json({ 
        success: false,
        error: error.message 
      });
      return;
    }
    next(error);
  }
};

export const uploadFoodImage = async (
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
