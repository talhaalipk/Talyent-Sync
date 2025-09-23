import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyUser,
  getIdAndRole,
  googleAuthUser,
} from '../Controllers/auth';
import { protect } from '../Middleware/auth';

const router = Router();

// Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Logout
router.post('/logout', logoutUser);

//gooogle
router.post('/google', googleAuthUser);

// Verify (protected)
router.get('/verify', protect, verifyUser);
router.get('/info', protect, getIdAndRole);

export default router;
