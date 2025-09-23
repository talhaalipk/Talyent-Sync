import express from 'express';
import {
  getAllFreelancers,
  getFreelancerById,
} from '../Controllers/freelancerController';

const router = express.Router();

// GET /api/freelancers - Get all freelancers with pagination and filters
router.get('/', getAllFreelancers);

// GET /api/freelancer/:id - Get specific freelancer by ID
router.get('/:id', getFreelancerById);

export default router;
