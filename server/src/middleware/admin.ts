import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../config/database';

/**
 * Middleware to require admin role
 * Must be used after authenticate middleware
 */
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Fetch user from database to get current role
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, role: true }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
      return;
    }

    // Update req.user with role from database
    req.user.role = user.role;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error checking admin status',
    });
  }
};

