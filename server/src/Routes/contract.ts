// src/Routes/contract.ts
import { Router } from 'express';
import { protect } from '../Middleware/auth';
import { requireRole } from '../Middleware/roleCheck';
import {
  validateTimesheet,
  validateTimesheetStatus,
  validateCompletionResponse,
  validateContractId,
} from '../Middleware/contractValidation';
import {
  getActiveJobs,
  getActiveJobDetails,
  addTimesheet,
  updateTimesheetStatus,
  requestContractCompletion,
  handleCompletionResponse,
} from '../Controllers/contractController';

const router = Router();

// Apply authentication middleware to all routes
router.use(protect);


// GET /api/contracts/active-jobs
router.get('/active-jobs', getActiveJobs);


// GET /api/contracts/active-job/:contractId
router.get('/active-job/:contractId', getActiveJobDetails);


//   POST /api/contracts/active-job/:contractId/add-timesheet
//   Add a timesheet entry to an hourly contract
//   Only accessible by freelancers
//   Body: { title: string, description: string, hoursWork: number }
router.post(
  '/active-job/:contractId/add-timesheet',
  validateContractId,
  requireRole(['freelancer']),
  validateTimesheet,
  addTimesheet
);


// PATCH /api/contracts/active-job/:contractId/timesheet-approval
// Approve or reject a timesheet entry
// Only accessible by clients
// Body: { timesheetId: string, status: 'approved' | 'reject', rejectionReason?: string }
router.patch(
  '/active-job/:contractId/timesheet-approval',
  validateContractId,
  requireRole(['client']),
  validateTimesheetStatus,
  updateTimesheetStatus
);


// PATCH /api/contracts/active-job/:contractId/request-completion
// Request contract completion (freelancer marks work as done)
// Only accessible by freelancers
// Changes contract status to 'awaiting_approval'
router.patch(
  '/active-job/:contractId/request-completion',
  validateContractId,
  requireRole(['freelancer']),
  requestContractCompletion
);


// PATCH /api/contracts/active-job/:contractId/completion-response
// Client response to completion request
// Only accessible by clients
// Body: { action: 'accept' | 'reject', feedback?: string }
// - Accept: Completes contract and releases payment
// - Reject: Sets contract to disputed status
router.patch(
  '/active-job/:contractId/completion-response',
  validateContractId,
  requireRole(['client']),
  validateCompletionResponse,
  handleCompletionResponse
);

export default router;
