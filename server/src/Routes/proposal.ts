import { Router } from 'express';
import { protect } from '../Middleware/auth';
import { requireRole } from '../Middleware/roleCheck';
import { uploadDocument } from '../config/cloudinary';
import {
  sendProposal,
  getProposalsByReceiverId,
  getProposalsBySenderId,
  getProposalById,
  updateProposal,
  updateProposalStatus,
  getProposalStats,
} from '../Controllers/proposalController';

const router = Router();

// POST /api/proposals/send
router.post(
  '/send',
  protect,
  requireRole(['freelancer']),
  uploadDocument.single('document'),
  sendProposal
);

// GET /api/proposals/received
router.get(
  '/received',
  protect,
  requireRole(['client']),
  getProposalsByReceiverId
);

// @route GET /api/proposals/sent
// @desc Get proposals sent by a freelancer
// @access Private (Freelancer only)
router.get(
  '/sent',
  protect,
  requireRole(['freelancer']),
  getProposalsBySenderId
);

// GET /api/proposals/stats
router.get('/stats', protect, getProposalStats);

// GET /api/proposals/:id
router.get('/:id', protect, getProposalById);

// PUT /api/proposals/:id
router.put(
  '/:id',
  protect,
  requireRole(['freelancer']),
  uploadDocument.single('document'),
  updateProposal
);

// PATCH /api/proposals/:id/status
router.patch(
  '/:id/status',
  protect,
  requireRole(['client']),
  updateProposalStatus
);

export default router;
