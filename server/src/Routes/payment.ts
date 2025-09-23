import { Router } from 'express';
import express from 'express';
import { protect } from '../Middleware/auth'; 
import {
  deposit,
  withdraw,
  addLedgerEntry,
  getWallet,
  confirmDeposit,
} from '../Controllers/paymentController';

const router = Router();

// Deposit via Stripe
router.post('/deposit', protect, deposit);

//confirm deposit after success redirect
router.get('/confirm-deposit', protect, confirmDeposit);

// Withdraw (simple)
router.post('/withdraw', protect, withdraw);

// NEW: Add ledger entry for escrow/release/refund
router.post('/addLedgerEntry', protect, addLedgerEntry);

// Get wallet by userId
router.get('/wallet/:userId', protect, getWallet);

export default router;
