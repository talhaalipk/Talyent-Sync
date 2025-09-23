// src/Controllers/Admin/adminAuthController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../../Models/user';
import { AuthRequest } from '../../Middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Helper function to generate profile pic from username
const generateProfilePic = (username: string): string => {
  if (!username)
    return 'https://ui-avatars.com/api/?name=Admin&background=134848&color=fff&size=200';
  const firstLetter = username.charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${firstLetter}&background=134848&color=fff&size=200`;
};

// POST /api/admin/auth/register
export const adminRegister = async (req: Request, res: Response) => {
  try {
    console.log('request body:', req.body);
    const { UserName, email, password, confirmPassword } = req.body;

    // Validation
    if (!UserName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { UserName }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email.toLowerCase()
            ? 'Email already exists'
            : 'Username already exists',
      });
    }

    // Hash password
    console.log('before hash');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate profile pic
    console.log('before profile pic');
    const profilePic = generateProfilePic(UserName);

    // Create admin user
    const newAdmin = await User.create({
      UserName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin', // Default role
      profilePic,
      isActive: true,
      adminProfile: {
        permissions: ['read'],
        department: 'General',
        loginAttempts: 0,
      },
    });
    console.log('after create user ');
    // Create JWT token
    const token = jwt.sign(
      {
        id: newAdmin._id,
        role: newAdmin.role,
        email: newAdmin.email,
        UserName: newAdmin.UserName,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Update last login
    newAdmin.adminProfile!.lastLogin = new Date();
    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      admin: {
        id: newAdmin._id,
        UserName: newAdmin.UserName,
        email: newAdmin.email,
        role: newAdmin.role,
        profilePic: newAdmin.profilePic,
        isActive: newAdmin.isActive,
      },
    });
  } catch (error: any) {
    console.error('Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

// POST /api/admin/auth/login
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find admin user
    const admin = await User.findOne({
      email: email.toLowerCase(),
      role: { $in: ['admin', 'super-admin'] },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    // Check if account is locked
    if (
      admin.adminProfile?.lockoutUntil &&
      admin.adminProfile.lockoutUntil > new Date()
    ) {
      return res.status(423).json({
        success: false,
        message:
          'Account is temporarily locked due to too many failed login attempts',
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      // Increment login attempts
      if (!admin.adminProfile) {
        admin.adminProfile = { loginAttempts: 0 };
      }
      admin.adminProfile.loginAttempts =
        (admin.adminProfile.loginAttempts || 0) + 1;

      // Lock account after 5 failed attempts
      if (admin.adminProfile.loginAttempts >= 5) {
        admin.adminProfile.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }

      await admin.save();

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Reset login attempts on successful login
    if (admin.adminProfile) {
      admin.adminProfile.loginAttempts = 0;
      admin.adminProfile.lockoutUntil = undefined;
      admin.adminProfile.lastLogin = new Date();
    }
    await admin.save();

    // Create JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
        email: admin.email,
        UserName: admin.UserName,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin._id,
        UserName: admin.UserName,
        email: admin.email,
        role: admin.role,
        profilePic: admin.profilePic,
        isActive: admin.isActive,
        lastLogin: admin.adminProfile?.lastLogin,
      },
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// POST /api/admin/auth/logout
export const adminLogout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('adminToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
    });
  }
};

// GET /api/admin/auth/verify
export const verifyAdminAuth = async (req: AuthRequest, res: Response) => {
  try {
    const adminToken = req.cookies?.adminToken;

    if (!adminToken) {
      return res.status(401).json({
        success: false,
        message: 'No admin token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(adminToken, JWT_SECRET) as {
      id: string;
      role: string;
      email: string;
      UserName: string;
    };

    // Check if user is admin
    if (!['admin', 'super-admin'].includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    // Get admin details
    const admin = await User.findById(decoded.id).select('-password');

    if (!admin || !admin.isActive) {
      res.clearCookie('adminToken');
      return res.status(401).json({
        success: false,
        message: 'Admin not found or inactive',
      });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        UserName: admin.UserName,
        email: admin.email,
        role: admin.role,
        profilePic: admin.profilePic,
        isActive: admin.isActive,
        lastLogin: admin.adminProfile?.lastLogin,
      },
    });
  } catch (error: any) {
    console.error('Admin auth verification error:', error);
    res.clearCookie('adminToken');
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};
