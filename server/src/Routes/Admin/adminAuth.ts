// src/Routes/Admin/adminAuth.ts
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import {
  adminRegister,
  adminLogin,
  adminLogout,
  verifyAdminAuth,
} from '../../Controllers/Admin/adminAuthController';

const router = Router();

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

// Admin registration validation
const validateAdminRegister = [
  body('UserName')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),

  handleValidationErrors,
];

// Admin login validation
const validateAdminLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password').notEmpty().withMessage('Password is required'),

  handleValidationErrors,
];


// POST /api/admin/auth/register
// Register a new admin account
// Body: { UserName, email, password, confirmPassword }
router.post('/register', validateAdminRegister, adminRegister);

// POST /api/admin/auth/login
// Login admin account
// Body: { email, password }
router.post('/login', validateAdminLogin, adminLogin);

// POST /api/admin/auth/logout
// Logout admin account (clears cookies)
router.post('/logout', adminLogout);

// GET /api/admin/auth/verify
// Verify admin authentication status
// Returns admin details if authenticated
router.get('/verify', verifyAdminAuth);

export default router;
