// src/Routes/review.ts
import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../Middleware/auth';
import { requireRole } from '../Middleware/roleCheck';
import {
  createReview,
  getMyReviews,
  getReviewEligibility,
  getJobReviews,
} from '../Controllers/reviewController';

const router = Router();

// Apply authentication middleware to all routes
router.use(protect);

// Validation middleware for creating reviews
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
];

/**
 * POST /api/reviews/contract/:contractId
 * Create a review for a completed contract
 * Both clients and freelancers can review each other
 */
router.post(
  '/contract/:contractId',
  requireRole(['client', 'freelancer']),
  validateReview,
  createReview
);

/**
 * GET /api/reviews/my-reviews
 * Get all reviews for the authenticated user (received and given)
 * Returns review statistics as well
 */
router.get('/my-reviews', requireRole(['client', 'freelancer']), getMyReviews);

/**
 * GET /api/reviews/contract/:contractId/eligibility
 * Check if user can review a specific contract
 * Returns eligibility status and reasons
 */
router.get(
  '/contract/:contractId/eligibility',
  requireRole(['client', 'freelancer']),
  getReviewEligibility
);

/**
 * GET /api/reviews/job/:jobId
 * Get all reviews for a specific job
 * Public endpoint (shows reviews to help with decision making)
 */
router.get('/job/:jobId', getJobReviews);

export default router;
