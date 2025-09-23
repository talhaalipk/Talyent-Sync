// src/Controllers/reviewController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Review, IReview } from '../Models/Review';
import { Contract } from '../Models/Contract';
import { Job } from '../Models/job';
import { User } from '../Models/user';
import { AuthRequest } from '../Middleware/auth';
import { notificationService } from '../services/notificationService';
import { sendEmail } from '../services/emailService';

// POST /api/reviews/contract/:contractId
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(contractId)) {
      return res.status(400).json({ message: 'Invalid contract ID' });
    }

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: 'Rating must be between 1 and 5' });
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    if (comment.trim().length > 1000) {
      return res
        .status(400)
        .json({ message: 'Comment must not exceed 1000 characters' });
    }

    // Find the contract and verify it's completed and user has access
    const contract = await Contract.findOne({
      _id: contractId,
      status: 'completed',
      $or: [{ clientId: userId }, { freelancerId: userId }],
    })
      .populate('jobId', 'title')
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email');

    if (!contract) {
      return res.status(404).json({
        message: 'Completed contract not found or access denied',
      });
    }

    // Check if user already reviewed this contract
    const existingReview = await Review.findOne({
      contractId: contractId,
      reviewerId: userId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this contract',
      });
    }

    // Determine reviewee (the other party)
    const isUserClient = contract.clientId._id.toString() === userId;
    const revieweeId = isUserClient
      ? contract.freelancerId._id
      : contract.clientId._id;
    const revieweeRole = isUserClient ? 'freelancer' : 'client';
    const reviewType = isUserClient
      ? 'client_to_freelancer'
      : 'freelancer_to_client';

    // Create review
    const review = await Review.create({
      contractId: contractId,
      jobId: contract.jobId._id,
      reviewerId: userId,
      revieweeId: revieweeId,
      reviewerRole: userRole,
      revieweeRole: revieweeRole,
      rating: Number(rating),
      comment: comment.trim(),
      reviewType: reviewType,
    });

    // Update user ratings
    await updateUserRatings(
      revieweeId.toString(),
      revieweeRole as 'client' | 'freelancer'
    );

    // Get populated review for response
    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'name UserName profilePic')
      .populate('revieweeId', 'name UserName profilePic')
      .populate('jobId', 'title')
      .populate('contractId');

    // Send notification to reviewee
    const reviewerUser = contract[
      isUserClient ? 'clientId' : 'freelancerId'
    ] as any;
    const revieweeUser = contract[
      isUserClient ? 'freelancerId' : 'clientId'
    ] as any;
    const job = contract.jobId as any;

    await notificationService.sendNotification({
      userId: revieweeId.toString(),
      type: 'rating_received',
      title: 'New Review Received!',
      body: `${reviewerUser.name || reviewerUser.UserName} gave you ${rating} stars for "${job.title}"`,
      data: {
        contractId: contractId,
        reviewId: review._id,
        rating: rating,
        type: 'review_received',
      },
      relatedId: contractId,
      fromUserId: userId,
    });

    // Send email notification
    try {
      await sendEmail(
        revieweeUser.email,
        `New ${rating}-Star Review Received!`,
        `
        <h3>You received a new review!</h3>
        <p><strong>Project:</strong> ${job.title}</p>
        <p><strong>Rating:</strong> ${rating}/5 stars</p>
        <p><strong>From:</strong> ${reviewerUser.name || reviewerUser.UserName}</p>
        <p><strong>Comment:</strong></p>
        <blockquote style="background: #f5f5f5; padding: 15px; border-left: 4px solid #2E90EB; margin: 15px 0;">
          "${comment.trim()}"
        </blockquote>
        <p>This review will help build your reputation on our platform!</p>
        `
      );
    } catch (emailError) {
      console.error('Failed to send review email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review: populatedReview,
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message,
    });
  }
};

// GET /api/reviews/my-reviews
export const getMyReviews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get reviews received by the user
    const reviewsReceived = await Review.find({ revieweeId: userId })
      .populate('reviewerId', 'name UserName profilePic')
      .populate('jobId', 'title category')
      .populate('contractId', 'type totalAmount hourlyRate createdAt')
      .sort({ createdAt: -1 });

    // Get reviews given by the user
    const reviewsGiven = await Review.find({ reviewerId: userId })
      .populate('revieweeId', 'name UserName profilePic')
      .populate('jobId', 'title category')
      .populate('contractId', 'type totalAmount hourlyRate createdAt')
      .sort({ createdAt: -1 });

    // Calculate user's rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { revieweeId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating',
          },
        },
      },
    ]);

    const stats =
      ratingStats.length > 0
        ? {
            averageRating: Math.round(ratingStats[0].averageRating * 10) / 10,
            totalReviews: ratingStats[0].totalReviews,
            ratingDistribution: ratingStats[0].ratingDistribution.reduce(
              (acc: any, rating: number) => {
                acc[rating] = (acc[rating] || 0) + 1;
                return acc;
              },
              {}
            ),
          }
        : {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: {},
          };

    res.status(200).json({
      success: true,
      data: {
        reviewsReceived,
        reviewsGiven,
        stats,
      },
    });
  } catch (error: any) {
    console.error('Error fetching my reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

// GET /api/reviews/contract/:contractId/eligibility
export const getReviewEligibility = async (req: AuthRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(contractId)) {
      return res.status(400).json({ message: 'Invalid contract ID' });
    }

    // Check if contract exists and is completed
    const contract = await Contract.findOne({
      _id: contractId,
      status: 'completed',
      $or: [{ clientId: userId }, { freelancerId: userId }],
    });

    if (!contract) {
      return res.status(404).json({
        canReview: false,
        message: 'Contract not found or not completed',
      });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      contractId: contractId,
      reviewerId: userId,
    });

    if (existingReview) {
      return res.status(200).json({
        canReview: false,
        message: 'You have already reviewed this contract',
        existingReview: true,
      });
    }

    res.status(200).json({
      canReview: true,
      message: 'You can review this contract',
    });
  } catch (error: any) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check review eligibility',
      error: error.message,
    });
  }
};

// GET /api/reviews/job/:jobId
export const getJobReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    const reviews = await Review.find({ jobId: jobId })
      .populate('reviewerId', 'name UserName profilePic')
      .populate('revieweeId', 'name UserName profilePic')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error: any) {
    console.error('Error fetching job reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job reviews',
      error: error.message,
    });
  }
};

// Helper function to update user ratings
const updateUserRatings = async (
  userId: string,
  userRole: 'client' | 'freelancer'
) => {
  try {
    const reviews = await Review.find({ revieweeId: userId });

    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    if (userRole === 'freelancer') {
      await User.findByIdAndUpdate(userId, {
        'freelancerProfile.ratingAvg': Math.round(averageRating * 10) / 10,
        'freelancerProfile.ratingCount': reviews.length,
      });
    } else if (userRole === 'client') {
      await User.findByIdAndUpdate(userId, {
        'clientProfile.clientRating': Math.round(averageRating * 10) / 10,
      });
    }
  } catch (error) {
    console.error('Error updating user ratings:', error);
  }
};
