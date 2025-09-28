// src/Routes/publicFreelancer.ts
import express from 'express';
import {
  getPublicFreelancerProfile,
  getFreelancerPortfolioItem,
} from '../Controllers/publicFreelancerController';

const router = express.Router();

// Public routes (no authentication required)
router.get('/:id', getPublicFreelancerProfile);
router.get('/:id/portfolio/:portfolioIndex', getFreelancerPortfolioItem);

export default router;
