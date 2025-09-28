import { Request, Response } from 'express';
import { User } from '../Models/user';
import { Contract } from '../Models/Contract';
import { Wallet } from '../Models/Wallet';
import { Review } from '../Models/Review';
import mongoose from 'mongoose';

// Type definitions for populated documents
interface PopulatedJob {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
}

interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  UserName: string;
  profilePic?: string;
}

interface PopulatedContract {
  _id: mongoose.Types.ObjectId;
  jobId: PopulatedJob;
  clientId: PopulatedUser;
  type: string;
  totalAmount?: number;
  hourlyRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PopulatedReview {
  _id: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  reviewerId: PopulatedUser;
  jobId: PopulatedJob;
}

export const getPublicFreelancerProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    console.log('id : ', id);
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid freelancer ID' });
    }

    // Get freelancer basic info
    const freelancer = await User.findById(id)
      .select('name UserName email profilePic freelancerProfile createdAt')
      .lean();

    console.log('Freelancer : ', freelancer);

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    // Get contract statistics
    const contractStats = await Contract.aggregate([
      { $match: { freelancerId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent completed contracts with job details
    const recentContracts = (await Contract.find({
      freelancerId: id,
      status: 'completed',
    })
      .populate('jobId', 'title description category')
      .populate('clientId', 'name UserName')
      .select('jobId clientId type totalAmount hourlyRate createdAt')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean()) as unknown as PopulatedContract[];

    // Get wallet information (total earnings)
    const wallet = await Wallet.findOne({ userId: id })
      .select('totalEarning')
      .lean();

    // Get reviews with client and job details
    const reviews = (await Review.find({
      revieweeId: id,
      reviewType: 'client_to_freelancer',
    })
      .populate('reviewerId', 'name UserName profilePic')
      .populate('jobId', 'title')
      .select('rating comment createdAt reviewerId jobId')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()) as unknown as PopulatedReview[];

    // Process contract statistics
    const stats = {
      totalContracts: 0,
      activeContracts: 0,
      completedContracts: 0,
      awaitingApproval: 0,
    };

    contractStats.forEach((stat) => {
      stats.totalContracts += stat.count;
      switch (stat._id) {
        case 'active':
          stats.activeContracts = stat.count;
          break;
        case 'completed':
          stats.completedContracts = stat.count;
          break;
        case 'awaiting_approval':
          stats.awaitingApproval = stat.count;
          break;
      }
    });

    // Format response
    const publicProfile = {
      id: freelancer._id,
      name: freelancer.name,
      username: freelancer.UserName,
      profilePic: freelancer.profilePic,
      memberSince: freelancer.createdAt,

      // Freelancer specific info
      bio: freelancer.freelancerProfile?.bio_desc || '',
      location: freelancer.freelancerProfile?.location || '',
      skills: freelancer.freelancerProfile?.skills || [],
      hourlyRate: freelancer.freelancerProfile?.hourlyRate || 0,
      successRate: freelancer.freelancerProfile?.successRate || 0,
      ratingAvg: freelancer.freelancerProfile?.ratingAvg || 0,
      ratingCount: freelancer.freelancerProfile?.ratingCount || 0,

      // Portfolio and certifications
      portfolio: freelancer.freelancerProfile?.portfolio || [],
      certifications: freelancer.freelancerProfile?.certifications || [],

      // Financial info
      totalEarnings: wallet?.totalEarning || 0,

      // Contract statistics
      contractStats: stats,

      // Recent work
      recentContracts: recentContracts.map((contract) => ({
        jobTitle: contract.jobId?.title || 'Untitled Project',
        jobCategory: contract.jobId?.category || '',
        clientName:
          contract.clientId?.name || contract.clientId?.UserName || 'Anonymous',
        type: contract.type,
        amount: contract.totalAmount || (contract.hourlyRate ? 'Hourly' : 0),
        completedAt: contract.createdAt,
      })),

      // Reviews
      reviews: reviews.map((review) => ({
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        jobTitle: review.jobId?.title || 'Project',
        client: {
          name:
            review.reviewerId?.name ||
            review.reviewerId?.UserName ||
            'Anonymous',
          profilePic: review.reviewerId?.profilePic,
        },
      })),
    };

    res.status(200).json({
      success: true,
      data: publicProfile,
    });
  } catch (error: any) {
    console.error('Error fetching public freelancer profile:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get freelancer's portfolio item details
export const getFreelancerPortfolioItem = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, portfolioIndex } = req.params;
    const index = parseInt(portfolioIndex);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid freelancer ID' });
    }

    const freelancer = await User.findById(id)
      .select('freelancerProfile.portfolio')
      .lean();

    if (!freelancer || !freelancer.freelancerProfile?.portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const portfolioItem = freelancer.freelancerProfile.portfolio[index];

    if (!portfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    res.status(200).json({
      success: true,
      data: portfolioItem,
    });
  } catch (error: any) {
    console.error('Error fetching portfolio item:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
