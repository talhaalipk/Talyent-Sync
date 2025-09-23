// src/Routes/Admin/adminDashboard.ts (Updated with Dispute Management)
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import {
  protectAdmin,
  requireSuperAdmin,
} from '../../Middleware/Admin/adminAuth';
import {
  getAllUsers,
  toggleUserStatus,
  getAllAdmins,
  toggleAdminStatus,
  changeAdminRole,
} from '../../Controllers/Admin/adminDashboardController';
import { getSystemAnalysis } from '../../Controllers/Admin/systemAnalysisController';
import {
  getDisputedContracts,
  getDisputeDetails,
  resolveToFreelancer,
  resolveToClient,
} from '../../Controllers/Admin/disputeController';

const router = Router();

// Apply admin protection to all routes
router.use(protectAdmin);

// Validation middleware
const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// Validation for status toggle
const validateStatusToggle = [
  body('isActive').isBoolean().withMessage('isActive must be a boolean value'),
  handleValidationErrors,
];

// Validation for role change
const validateRoleChange = [
  body('role')
    .isIn(['admin', 'super-admin'])
    .withMessage('Role must be either admin or super-admin'),
  handleValidationErrors,
];

// Validation for dispute resolution note
const validateDisputeResolution = [
  body('note')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note must be a string with maximum 500 characters'),
  handleValidationErrors,
];

/**
 * GET /api/admin/dashboard/users
 * Get all users (clients and freelancers)
 * Query params: filter=all|active|inactive
 */
router.get('/users', getAllUsers);

/**
 * PATCH /api/admin/dashboard/users/:userId/status
 * Toggle user active/inactive status
 * Body: { isActive: boolean }
 */
router.patch('/users/:userId/status', validateStatusToggle, toggleUserStatus);

/**
 * GET /api/admin/dashboard/admins
 * Get all admin users
 * Query params: filter=all|active|inactive
 */
router.get('/admins', getAllAdmins);

/**
 * PATCH /api/admin/dashboard/admins/:adminId/status
 * Toggle admin active/inactive status (super-admin only)
 * Body: { isActive: boolean }
 */
router.patch(
  '/admins/:adminId/status',
  requireSuperAdmin,
  validateStatusToggle,
  toggleAdminStatus
);

/**
 * PATCH /api/admin/dashboard/admins/:adminId/role
 * Change admin role (super-admin only)
 * Body: { role: 'admin' | 'super-admin' }
 */
router.patch(
  '/admins/:adminId/role',
  requireSuperAdmin,
  validateRoleChange,
  changeAdminRole
);

/**
 * GET /api/admin/dashboard/system-analysis
 * Get comprehensive system analytics
 */
router.get('/system-analysis', getSystemAnalysis);

/**
 * GET /api/admin/dashboard/disputes
 * Get all disputed contracts
 */
router.get('/disputes', getDisputedContracts);

/**
 * GET /api/admin/dashboard/disputes/:contractId
 * Get specific dispute details
 */
router.get('/disputes/:contractId', getDisputeDetails);

/**
 * POST /api/admin/dashboard/disputes/:contractId/resolve-to-freelancer
 * Resolve dispute in favor of freelancer
 * Body: { note?: string }
 */
router.post(
  '/disputes/:contractId/resolve-to-freelancer',
  validateDisputeResolution,
  resolveToFreelancer
);

/**
 * POST /api/admin/dashboard/disputes/:contractId/resolve-to-client
 * Resolve dispute in favor of client
 * Body: { note?: string }
 */
router.post(
  '/disputes/:contractId/resolve-to-client',
  validateDisputeResolution,
  resolveToClient
);

export default router;
