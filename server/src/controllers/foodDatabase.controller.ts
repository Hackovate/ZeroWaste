import { Request, Response, NextFunction } from 'express';
import { foodDatabaseService } from '../services/foodDatabase.service';

export const getFoodDatabase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const items = await foodDatabaseService.getAll();
    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

export const searchFoodDatabase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.json({
        success: true,
        data: [],
      });
    }
    const items = await foodDatabaseService.search(q);
    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

