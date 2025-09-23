import { Request, Response } from 'express';
import { User } from '../Models/user';
import { AuthRequest } from '../Middleware/auth';
import { cloudinary } from '../config/cloudinary';
import { extractSkillsFromCVText, validateCVText } from '../services/geminiApi';
import bcrypt from 'bcrypt';

// GET /api/profile/me
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// PUT /api/profile/update
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Common fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.UserName) user.UserName = req.body.UserName;

    // Role-specific updates
    if (user.role === 'client' && req.body.clientProfile) {
      user.clientProfile = {
        ...user.clientProfile,
        ...req.body.clientProfile,
      };
    }

    if (user.role === 'freelancer' && req.body.freelancerProfile) {
      user.freelancerProfile = {
        ...user.freelancerProfile,
        ...req.body.freelancerProfile,
      };
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// PUT /api/profile/freelancer
// export const updateFreelancerProfile = async (req: AuthRequest, res: Response) => {
//   try {
//     const user = await User.findById(req.user?.id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     // Check if user is a freelancer
//     if (user.role !== "freelancer") {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied. Only freelancers can update freelancer profile"
//       });
//     }

//     const {
//       location,
//       skills,
//       hourlyRate,
//       portfolio,
//       certifications,

//     } = req.body;

//     // Initialize freelancerProfile if it doesn't exist
//     if (!user.freelancerProfile) {
//       user.freelancerProfile = {};
//     }

//     // Update freelancer profile fields
//     if (location !== undefined) user.freelancerProfile.location = location;
//     if (skills !== undefined) {
//       // Validate skills array
//       if (Array.isArray(skills)) {
//         user.freelancerProfile.skills = skills.filter(skill =>
//           typeof skill === 'string' && skill.trim().length > 0
//         );
//       }
//     }
//     if (hourlyRate !== undefined) {
//       if (hourlyRate >= 0) {
//         user.freelancerProfile.hourlyRate = hourlyRate;
//       }
//     }
//     if (portfolio !== undefined) {
//       // Validate portfolio array
//       if (Array.isArray(portfolio)) {
//         user.freelancerProfile.portfolio = portfolio.filter(item =>
//           item.title && item.url && typeof item.title === 'string' && typeof item.url === 'string'
//         );
//       }
//     }
//     if (certifications !== undefined) {
//       // Validate certifications array
//       if (Array.isArray(certifications)) {
//         user.freelancerProfile.certifications = certifications.filter(cert =>
//           cert.title && cert.issuer && typeof cert.title === 'string' && typeof cert.issuer === 'string'
//         );
//       }
//     }

//     const updatedUser = await user.save();

//     res.json({
//       success: true,
//       message: "Freelancer profile updated successfully",
//       data: {
//         freelancerProfile: updatedUser.freelancerProfile
//       }
//     });

//   } catch (error) {
//     console.error("Error updating freelancer profile:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while updating freelancer profile",
//       error: error
//     });
//   }
// };
// export const updateFreelancerProfile = async (req: AuthRequest, res: Response) => {
//   try {
//     const user = await User.findById(req.user?.id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Check if user is a freelancer
//     if (user.role !== "freelancer") {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied. Only freelancers can update freelancer profile",
//       });
//     }

//     const {
//       bio_desc,
//       location,
//       skills,
//       hourlyRate,
//       portfolio,
//       certifications,
//     } = req.body;

//     // Initialize freelancerProfile if it doesn't exist
//     if (!user.freelancerProfile) {
//       user.freelancerProfile = {};
//     }

//     // ✅ Update freelancer profile fields
//     if (bio_desc !== undefined && typeof bio_desc === "string") {
//       user.freelancerProfile.bio_desc = bio_desc.trim();
//     }

//     if (location !== undefined) {
//       user.freelancerProfile.location = location;
//     }

//     if (skills !== undefined) {
//       if (Array.isArray(skills)) {
//         user.freelancerProfile.skills = skills.filter(
//           (skill) => typeof skill === "string" && skill.trim().length > 0
//         );
//       }
//     }

//     if (hourlyRate !== undefined) {
//       if (typeof hourlyRate === "number" && hourlyRate >= 0) {
//         user.freelancerProfile.hourlyRate = hourlyRate;
//       }
//     }

//     if (portfolio !== undefined) {
//       if (Array.isArray(portfolio)) {
//         user.freelancerProfile.portfolio = portfolio.filter(
//           (item) =>
//             item &&
//             typeof item.title === "string" &&
//             typeof item.url === "string" &&
//             item.title.trim().length > 0 &&
//             item.url.trim().length > 0
//         );
//       }
//     }

//     if (certifications !== undefined) {
//       if (Array.isArray(certifications)) {
//         user.freelancerProfile.certifications = certifications.filter(
//           (cert) =>
//             cert &&
//             typeof cert.title === "string" &&
//             typeof cert.issuer === "string" &&
//             cert.title.trim().length > 0 &&
//             cert.issuer.trim().length > 0
//         );
//       }
//     }

//     const updatedUser = await user.save();

//     return res.json({
//       success: true,
//       message: "Freelancer profile updated successfully",
//       data: {
//         freelancerProfile: updatedUser.freelancerProfile,
//       },
//     });
//   } catch (error) {
//     console.error("Error updating freelancer profile:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while updating freelancer profile",
//       error: error instanceof Error ? error.message : error,
//     });
//   }
// };

// PUT /api/profile/freelancer
export const updateFreelancerProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    console.log('SDKS');
    console.log('🔍 RAW REQUEST BODY:', JSON.stringify(req.body, null, 2));

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is a freelancer
    if (user.role !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message:
          'Access denied. Only freelancers can update freelancer profile',
      });
    }

    const {
      bio_desc,
      location,
      skills,
      hourlyRate,
      portfolio,
      certifications,
    } = req.body;

    // ✅ DEBUG: Log the extracted bio_desc
    console.log('🔍 EXTRACTED bio_desc:', bio_desc);
    console.log('🔍 bio_desc TYPE:', typeof bio_desc);
    console.log('🔍 bio_desc LENGTH:', bio_desc?.length);

    // ✅ COMPLETELY DIFFERENT APPROACH - Build the entire freelancerProfile object
    const currentProfile = user.freelancerProfile || {};

    const updatedProfile = {
      ...currentProfile,
      // Keep existing fields that aren't being updated
      successRate: currentProfile.successRate || 5,
      ratingAvg: currentProfile.ratingAvg || 5,
      ratingCount: currentProfile.ratingCount || 0,
      reviews: currentProfile.reviews || [],
    };

    // ✅ EXPLICIT FIELD UPDATES
    if (bio_desc !== undefined) {
      // Handle bio_desc very explicitly
      if (typeof bio_desc === 'string') {
        updatedProfile.bio_desc = bio_desc; // Don't trim yet, let's see raw value
      } else {
        updatedProfile.bio_desc = String(bio_desc || '');
      }
    }

    if (location !== undefined) {
      updatedProfile.location = location;
    }

    if (skills !== undefined && Array.isArray(skills)) {
      updatedProfile.skills = skills.filter(
        (skill) => typeof skill === 'string' && skill.trim().length > 0
      );
    }

    if (
      hourlyRate !== undefined &&
      typeof hourlyRate === 'number' &&
      hourlyRate >= 0
    ) {
      updatedProfile.hourlyRate = hourlyRate;
    }

    if (portfolio !== undefined && Array.isArray(portfolio)) {
      updatedProfile.portfolio = portfolio.filter(
        (item) =>
          item &&
          typeof item.title === 'string' &&
          typeof item.url === 'string' &&
          item.title.trim().length > 0 &&
          item.url.trim().length > 0
      );
    }

    if (certifications !== undefined && Array.isArray(certifications)) {
      updatedProfile.certifications = certifications.filter(
        (cert) =>
          cert &&
          typeof cert.title === 'string' &&
          typeof cert.issuer === 'string' &&
          cert.title.trim().length > 0 &&
          cert.issuer.trim().length > 0
      );
    }

    console.log(
      '🔍 PROFILE BEFORE UPDATE:',
      JSON.stringify(updatedProfile, null, 2)
    );

    // ✅ REPLACE THE ENTIRE FREELANCER PROFILE
    const updatedUser = await User.findByIdAndUpdate(
      req.user?.id,
      {
        $set: {
          freelancerProfile: updatedProfile,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found after update',
      });
    }

    console.log(
      '🔍 FINAL SAVED bio_desc:',
      updatedUser.freelancerProfile?.bio_desc
    );
    console.log(
      '🔍 FINAL PROFILE:',
      JSON.stringify(updatedUser.freelancerProfile, null, 2)
    );

    return res.json({
      success: true,
      message: 'Freelancer profile updated successfully',
      data: {
        freelancerProfile: updatedUser.freelancerProfile,
      },
    });
  } catch (error) {
    console.error('Error updating freelancer profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating freelancer profile',
      error: error instanceof Error ? error.message : error,
    });
  }
};

// PUT /api/profile/client
export const updateClientProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is a client
    if (user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only clients can update client profile',
      });
    }

    const { location, companyName, budget, companyDescription } = req.body;

    // Initialize clientProfile if it doesn't exist
    if (!user.clientProfile) {
      user.clientProfile = {};
    }

    // ✅ Correct updates
    if (location !== undefined) user.clientProfile.location = location;
    if (companyName !== undefined) user.clientProfile.companyName = companyName;
    if (companyDescription !== undefined)
      user.clientProfile.companyDescription = companyDescription;
    if (budget !== undefined) {
      const parsedBudget = Number(budget);
      if (!isNaN(parsedBudget) && parsedBudget >= 0) {
        user.clientProfile.budget = parsedBudget;
      }
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Client profile updated successfully',
      data: {
        clientProfile: updatedUser.clientProfile,
      },
    });
  } catch (error) {
    console.error('Error updating client profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating client profile',
      error: error,
    });
  }
};

// POST /api/profile/extract-skills
export const extractSkillsFromCV = async (req: AuthRequest, res: Response) => {
  try {
    const { cvText } = req.body;

    // Validate input
    if (!cvText || typeof cvText !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'CV text is required and must be a string',
      });
    }

    // Validate CV text format
    if (!validateCVText(cvText)) {
      return res.status(400).json({
        success: false,
        message: "The provided text doesn't appear to be a valid CV/Resume",
      });
    }

    // Check text length (should be reasonable for a CV)
    if (cvText.length > 10000) {
      return res.status(400).json({
        success: false,
        message: 'CV text is too long. Maximum 10,000 characters allowed.',
      });
    }

    // Extract skills using Gemini AI
    const extractedSkills = await extractSkillsFromCVText(cvText);

    // If user is a freelancer, optionally update their profile
    const user = await User.findById(req.user?.id);
    if (user && user.role === 'freelancer') {
      // Initialize freelancerProfile if it doesn't exist
      if (!user.freelancerProfile) {
        user.freelancerProfile = {};
      }

      // Merge new skills with existing ones (remove duplicates)
      const existingSkills = user.freelancerProfile.skills || [];
      const newSkills = [
        ...new Set([...existingSkills, ...extractedSkills.skills]),
      ];

      // Optionally auto-update the freelancer's skills
      // user.freelancerProfile.skills = newSkills;
      // await user.save();
    }

    res.json({
      success: true,
      message: 'Skills extracted successfully',
      data: {
        extractedSkills,
        suggestion:
          user && user.role === 'freelancer'
            ? 'You can update your profile with these extracted skills using the freelancer profile update API'
            : 'Skills extracted from CV',
      },
    });
  } catch (error: any) {
    console.error('Error extracting skills:', error);

    if (error.message === 'Failed to extract skills from CV') {
      res.status(503).json({
        success: false,
        message: 'AI service temporarily unavailable. Please try again later.',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Server error while extracting skills',
        error: error.message,
      });
    }
  }
};

// POST /api/profile/upload-image
export const addImage = async (req: AuthRequest, res: Response) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    // Find user
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete old profile picture from Cloudinary if it exists and is not the default
    const defaultImageUrl =
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmUiF-YGjavA63_Au8jQj7zxnFxS_Ay9xc6pxleMqCxH92SzeNSjBTwZ0l61E4B3KTS7o&usqp=CAU';

    if (user.profilePic && user.profilePic !== defaultImageUrl) {
      try {
        // Extract public_id from the old image URL
        const urlParts = user.profilePic.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `profile_pictures/${publicIdWithExtension.split('.')[0]}`;

        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.log('Error deleting old image:', deleteError);
        // Continue with the update even if deletion fails
      }
    }

    // Update user's profile picture URL
    user.profilePic = (req.file as any).path; // Cloudinary URL
    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profilePic: updatedUser.profilePic,
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          profilePic: updatedUser.profilePic,
        },
      },
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading image',
      error: error,
    });
  }
};

// PUT /api/profile/change-password
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    // Validate new password strength (optional - adjust as needed)
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    // Find user
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password',
      error: error,
    });
  }
};
