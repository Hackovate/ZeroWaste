import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export const getResources = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, page, limit } = req.query;
    
    // Parse pagination parameters
    const pageNumber = page ? parseInt(page as string, 10) : 1;
    const pageSize = limit ? parseInt(limit as string, 10) : 9; // Default 9 items per page
    const skip = (pageNumber - 1) * pageSize;

    // Build where clause - categories are normalized to lowercase
    const where = category ? { category: (category as string).toLowerCase() } : {};

    // Get total count for pagination
    const total = await prisma.resource.count({ where });

    // Get paginated resources
    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPreviousPage = pageNumber > 1;

    res.json({
      success: true,
      data: resources,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    next(error);
  }
};
