import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export const getResources = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.query;

    const resources = await prisma.resource.findMany({
      where: category ? { category: category as string } : {},
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};
