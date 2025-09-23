import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';

// Validation for adding timesheet
export const validateTimesheet = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),

  body('hoursWork')
    .isFloat({ min: 0.1, max: 24 })
    .withMessage('Hours worked must be between 0.1 and 24'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];

// Validation for timesheet status update
export const validateTimesheetStatus = [
  body('timesheetId').isMongoId().withMessage('Valid timesheet ID is required'),

  body('status')
    .isIn(['approved', 'reject'])
    .withMessage('Status must be either approved or reject'),

  body('rejectionReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Rejection reason must not exceed 500 characters'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];

// Validation for completion response
export const validateCompletionResponse = [
  body('action')
    .isIn(['accept', 'reject'])
    .withMessage('Action must be either accept or reject'),

  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Feedback must not exceed 1000 characters'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];

// Validation for contract ID parameter
export const validateContractId = [
  param('contractId').isMongoId().withMessage('Valid contract ID is required'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID',
        errors: errors.array(),
      });
    }
    next();
  },
];
