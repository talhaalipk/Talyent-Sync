import { Request, Response } from 'express';
import { User } from '../Models/user';
import mongoose from 'mongoose';

export interface FreelancerQuery {
  page?: string;
  limit?: string;
  ratingAvg?: string;
  ratingCount?: string;
  successRate?: string;
  location?: string;
  sortBy?: 'ratingAvg' | 'successRate' | 'ratingCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export const getAllFreelancers = async (
  req: Request<{}, {}, {}, FreelancerQuery>,
  res: Response
) => {
  try {
    const {
      page = '1',
      limit = '10',
      ratingAvg,
      ratingCount,
      successRate,
      location,
      sortBy = 'ratingAvg',
      sortOrder = 'desc',
    } = req.query;

    // Convert string parameters to numbers
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 per page
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filterQuery: any = {
      role: 'freelancer',
      isActive: true,
      freelancerProfile: { $exists: true },
    };

    // Apply filters
    if (ratingAvg) {
      const rating = parseFloat(ratingAvg);
      if (!isNaN(rating) && rating >= 0 && rating <= 5) {
        filterQuery['freelancerProfile.ratingAvg'] = { $gte: rating };
      }
    }

    if (ratingCount) {
      const count = parseInt(ratingCount);
      if (!isNaN(count) && count >= 0) {
        filterQuery['freelancerProfile.ratingCount'] = { $gte: count };
      }
    }

    if (successRate) {
      const rate = parseFloat(successRate);
      if (!isNaN(rate) && rate >= 0 && rate <= 100) {
        filterQuery['freelancerProfile.successRate'] = { $gte: rate };
      }
    }

    if (location && location.trim()) {
      filterQuery['freelancerProfile.location'] = {
        $regex: location.trim(),
        $options: 'i', // case insensitive
      };
    }

    // Build sort query
    const sortQuery: any = {};
    const validSortFields = [
      'ratingAvg',
      'successRate',
      'ratingCount',
      'createdAt',
    ];

    if (validSortFields.includes(sortBy)) {
      if (sortBy === 'createdAt') {
        sortQuery[sortBy] = sortOrder === 'asc' ? 1 : -1;
      } else {
        sortQuery[`freelancerProfile.${sortBy}`] = sortOrder === 'asc' ? 1 : -1;
      }
    } else {
      sortQuery['freelancerProfile.ratingAvg'] = -1; // default sort
    }

    // Execute query with pagination
    const [freelancers, totalCount] = await Promise.all([
      User.find(filterQuery)
        .select('-password -__v') // Exclude sensitive fields
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(), // Use lean for better performance
      User.countDocuments(filterQuery),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        freelancers,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? pageNum + 1 : null,
          prevPage: hasPrevPage ? pageNum - 1 : null,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching freelancers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching freelancers',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export const getFreelancerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid freelancer ID format',
      });
    }

    // Find freelancer by ID
    const freelancer = await User.findOne({
      _id: id,
      role: 'freelancer',
      isActive: true,
    })
      .select('-password -__v') // Exclude sensitive fields
      .populate({
        path: 'freelancerProfile.reviews.clientId',
        select: 'name UserName profilePic', // Only select necessary client fields
        model: 'User',
      })
      .lean();

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer not found or inactive',
      });
    }

    // Check if freelancer has a profile
    if (!freelancer.freelancerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        freelancer,
      },
    });
  } catch (error) {
    console.error('Error fetching freelancer by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching freelancer',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};
