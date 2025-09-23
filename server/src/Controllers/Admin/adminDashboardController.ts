// src/Controllers/Admin/adminDashboardController.ts
import { Response } from 'express';
import { User } from '../../Models/user';
import { AdminAuthRequest } from '../../Middleware/Admin/adminAuth';
import mongoose from 'mongoose';

// GET /api/admin/dashboard/users - Get all users (freelancers and clients)
export const getAllUsers = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { filter = 'all' } = req.query;

    // Build query based on filter
    let query: any = { role: { $in: ['client', 'freelancer'] } };

    if (filter === 'active') {
      query.isActive = true;
    } else if (filter === 'inactive') {
      query.isActive = false;
    }

    const users = await User.find(query)
      .select('UserName email role profilePic isActive createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

// PATCH /api/admin/dashboard/users/:userId/status - Toggle user active status
export const toggleUserStatus = async (
  req: AdminAuthRequest,
  res: Response
) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value',
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Ensure user is client or freelancer
    if (!['client', 'freelancer'].includes(user.role)) {
      return res.status(400).json({
        success: false,
        message: 'Can only modify client or freelancer accounts',
      });
    }

    // Update user status
    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        UserName: user.UserName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
    });
  }
};

// GET /api/admin/dashboard/admins - Get all admin users
export const getAllAdmins = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { filter = 'all' } = req.query;

    // Build query based on filter
    let query: any = { role: { $in: ['admin', 'super-admin'] } };

    if (filter === 'active') {
      query.isActive = true;
    } else if (filter === 'inactive') {
      query.isActive = false;
    }

    const admins = await User.find(query)
      .select('UserName email role profilePic isActive createdAt adminProfile')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      admins,
      count: admins.length,
    });
  } catch (error: any) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins',
    });
  }
};

// PATCH /api/admin/dashboard/admins/:adminId/status - Toggle admin active status (super-admin only)
export const toggleAdminStatus = async (
  req: AdminAuthRequest,
  res: Response
) => {
  try {
    const { adminId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value',
      });
    }

    // Find the admin
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    // Ensure user is admin
    if (!['admin', 'super-admin'].includes(admin.role)) {
      return res.status(400).json({
        success: false,
        message: 'Can only modify admin accounts',
      });
    }

    // Prevent super-admin from deactivating themselves
    if (
      (admin._id as mongoose.Types.ObjectId).toString() === req.admin!.id &&
      !isActive
    ) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account',
      });
    }

    // Update admin status
    admin.isActive = isActive;
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Admin ${isActive ? 'activated' : 'deactivated'} successfully`,
      admin: {
        id: admin._id,
        UserName: admin.UserName,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
      },
    });
  } catch (error: any) {
    console.error('Error toggling admin status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin status',
    });
  }
};

// PATCH /api/admin/dashboard/admins/:adminId/role - Change admin role (super-admin only)
export const changeAdminRole = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { adminId } = req.params;
    const { role } = req.body;

    if (!['admin', 'super-admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either admin or super-admin',
      });
    }

    // Find the admin
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    // Ensure user is admin
    if (!['admin', 'super-admin'].includes(admin.role)) {
      return res.status(400).json({
        success: false,
        message: 'Can only modify admin accounts',
      });
    }

    // Prevent super-admin from demoting themselves
    if (
      (admin._id as mongoose.Types.ObjectId).toString() === req.admin!.id &&
      role === 'admin'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Cannot demote your own account',
      });
    }

    // Update admin role
    admin.role = role as 'admin' | 'super-admin';
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Admin role changed to ${role} successfully`,
      admin: {
        id: admin._id,
        UserName: admin.UserName,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
      },
    });
  } catch (error: any) {
    console.error('Error changing admin role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change admin role',
    });
  }
};
