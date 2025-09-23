import { Router } from 'express';
import { protect } from '../Middleware/auth';
import {
  getMyProfile,
  updateMyProfile,
  addImage,
  updateFreelancerProfile,
  updateClientProfile,
  extractSkillsFromCV,
  changePassword,
} from '../Controllers/profileController';
import { upload } from '../config/cloudinary';

const router = Router();

//  GET /api/profile/me
router.get('/', protect, getMyProfile);

//  PUT /api/profile/update
router.put('/', protect, updateMyProfile);

//  POST /api/profile/upload-image
router.post('/upload-image', protect, upload.single('profilePic'), addImage);

// PUT /api/profile/freelancer)
router.put('/freelancer', protect, updateFreelancerProfile);

// PUT /api/profile/client
router.put('/client', protect, updateClientProfile);

// POST /api/profile/extract-skills
router.post('/extract-skills', protect, extractSkillsFromCV);

// PUT /api/profile/change-password
router.put('/change-password', protect, changePassword);

export default router;
