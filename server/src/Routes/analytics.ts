// src/Routes/analytics.ts
import { Router } from 'express';
import { protect } from '../Middleware/auth';
import { requireRole } from '../Middleware/roleCheck';
import { getMyAnalytics } from '../Controllers/analyticsController';

const router = Router();

// authentication middleware to all routes
router.use(protect);

//  GET /api/analytics/my-stats
router.get('/my-stats', requireRole(['client', 'freelancer']), getMyAnalytics);

export default router;
