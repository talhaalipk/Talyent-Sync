import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../Models/user'; // Import User model

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;

    if (!token)
      return res.status(401).json({ message: 'Not authorized, no token' });

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };

    // NEW: Check if user exists and is active
    const user = await User.findById(decoded.id).select('isActive');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      // Clear cookie for deactivated user
      res.clearCookie('token');
      return res.status(403).json({
        message: 'Account is deactivated. Please contact support.',
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};
