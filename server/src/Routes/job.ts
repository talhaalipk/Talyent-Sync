import { Router } from 'express';
import { protect } from '../Middleware/auth';
import { requireRole } from '../Middleware/roleCheck';

import {
  getAllJobs,
  getJobsByClient,
  createJob,
  updateJob,
  deleteJob,
  searchJobsPublic, 
  getPublicJobById,
  generateJobDetailsController,
} from '../Controllers/jobController';

const router = Router();

// Public routes (Public)
router.get('/all-jobs', getAllJobs);
router.get('/all-jobs/:clientId', getJobsByClient);
router.get('/public/jobs', searchJobsPublic);
router.get('/public/job/:id', getPublicJobById);

// Protected routes (Client only)
router.post('/jobadd', protect, requireRole(['client']), createJob);
router.put('/jobupdate/:id', protect, requireRole(['client']), updateJob);
router.delete('/jobdelete/:id', protect, requireRole(['client']), deleteJob);

//Ai Job descrioption
router.post('/generatejobdescription', generateJobDetailsController);

export default router;
