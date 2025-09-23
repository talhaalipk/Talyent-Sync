// src/Middleware/Admin/adminAuth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../Models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export interface AdminAuthRequest extends Request {
  admin?: {
    id: string;
    role: 'admin' | 'super-admin';
    email: string;
    UserName: string;
  };
}

// Middleware to protect admin routes
export const protectAdmin = async (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.adminToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Admin authentication required.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
      email: string;
      UserName: string;
    };

    // Check if user has admin privileges
    if (!['admin', 'super-admin'].includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    // Verify admin still exists and is active
    const admin = await User.findById(decoded.id).select('isActive role');

    if (!admin) {
      res.clearCookie('adminToken');
      return res.status(401).json({
        success: false,
        message: 'Admin account not found.',
      });
    }

    if (!admin.isActive) {
      res.clearCookie('adminToken');
      return res.status(403).json({
        success: false,
        message: 'Admin account is deactivated.',
      });
    }

    req.admin = {
      id: decoded.id,
      role: decoded.role as 'admin' | 'super-admin',
      email: decoded.email,
      UserName: decoded.UserName,
    };

    next();
  } catch (error) {
    res.clearCookie('adminToken');
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired admin token.',
    });
  }
};

// Middleware to require super-admin role
export const requireSuperAdmin = (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.admin.role !== 'super-admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.',
    });
  }

  next();
};
