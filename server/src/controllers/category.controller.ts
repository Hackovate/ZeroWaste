import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await categoryService.getAll();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

