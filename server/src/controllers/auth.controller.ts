import { Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'User already exists with this email') {
      res.status(409).json({ 
        success: false,
        error: error.message 
      });
      return;
    }
    next(error);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid email or password') {
      res.status(401).json({ 
        success: false,
        error: error.message 
      });
      return;
    }
    next(error);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await authService.getProfile(req.user!.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await authService.updateProfile(req.user!.id, req.body);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
