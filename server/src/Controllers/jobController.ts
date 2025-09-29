import { Request, RequestHandler, Response } from 'express';
import { AuthRequest } from '../Middleware/auth';
import { Job } from '../Models/job';
import { User } from '../Models/user';
import { generateJobDetailsAI } from '../services/geminiApi';
import { notificationService } from '../services/notificationService';
import mongoose from 'mongoose';

// GET /api/jobs/all-jobs - Get all published jobs
export const getAllJobs = async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await Job.find({
      status: 'published',
      visibility: 'public',
    })
      .populate('clientId', 'name UserName email clientProfile.companyName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// GET /api/jobs/all-jobs/:clientId - Get jobs by specific client
export const getJobsByClient = async (req: AuthRequest, res: Response) => {
  try {
    const { clientId } = req.params;

    // Check if client exists
    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    const jobs = await Job.find({ clientId })
      .populate('clientId', 'name UserName email clientProfile.companyName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// NEW ENDPOINT: GET /api/jobs/public/search - Public job search with filters and pagination
export const searchJobsPublic = async (req: any, res: Response) => {
  try {
    const {
      search,
      category,
      jobType,
      experienceLevel,
      minBudget,
      maxBudget,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter object
    const filter: any = {
      status: 'published',
      visibility: 'public',
    };

    // Search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Job type filter
    if (jobType && jobType !== 'all') {
      filter.jobType = jobType;
    }

    // Experience level filter
    if (experienceLevel && experienceLevel !== 'all') {
      filter.experienceLevel = experienceLevel;
    }

    // Budget range filter
    if (minBudget || maxBudget) {
      const orConditions: any[] = [];

      // Fixed-price jobs
      const fixedCond: any = {};
      if (minBudget) fixedCond['budget.amount'] = { $gte: Number(minBudget) };
      if (maxBudget)
        fixedCond['budget.amount'] = {
          ...(fixedCond['budget.amount'] || {}),
          $lte: Number(maxBudget),
        };
      if (Object.keys(fixedCond).length) orConditions.push(fixedCond);

      // Hourly jobs
      const hourlyCond: any = {};
      if (minBudget)
        hourlyCond['budget.hourlyRate.min'] = { $gte: Number(minBudget) };
      if (maxBudget)
        hourlyCond['budget.hourlyRate.max'] = { $lte: Number(maxBudget) };
      if (Object.keys(hourlyCond).length) orConditions.push(hourlyCond);

      if (orConditions.length) {
        filter.$or = orConditions;
      }
    }

    // Pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const jobs = await Job.find(filter)
      .populate(
        'clientId',
        'name UserName email profilePic clientProfile.companyName clientProfile.location clientProfile.clientRating'
      )
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / limitNum);

    // Get unique categories for filter options
    const categories = await Job.distinct('category', {
      status: 'published',
      visibility: 'public',
    });

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalJobs,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum,
        },
        filters: {
          categories,
          jobTypes: ['fixed', 'hourly'],
          experienceLevels: ['entry', 'intermediate', 'expert'],
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// NEW ENDPOINT: GET /api/jobs/public/job/:id - Get single job by ID with client info
export const getPublicJobById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format',
      });
    }

    // Find the job with client information
    const job = await Job.findById(id).populate(
      'clientId',
      'name UserName email profilePic clientProfile.companyName clientProfile.location clientProfile.clientRating'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Only return published and public jobs
    if (job.status !== 'published' || job.visibility !== 'public') {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not available',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        job,
        client: job.clientId, // This contains the populated client information
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      jobType,
      budget,
      duration,
      skillsRequired,
      experienceLevel,
      attachments,
      status,
      visibility,
      invitedFreelancers,
    } = req.body;

    // Validation
    if (
      !title ||
      !description ||
      !category ||
      !subcategory ||
      !jobType ||
      !experienceLevel
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: title, description, category, subcategory, jobType, experienceLevel',
      });
    }

    if (!budget || !budget.jobType) {
      return res.status(400).json({
        success: false,
        message: 'Budget information is required',
      });
    }

    // Validate budget based on job type
    if (budget.jobType === 'fixed' && !budget.amount) {
      return res.status(400).json({
        success: false,
        message: 'Fixed budget amount is required for fixed jobs',
      });
    }

    if (
      budget.jobType === 'hourly' &&
      (!budget.hourlyRate || !budget.hourlyRate.min || !budget.hourlyRate.max)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Hourly rate range is required for hourly jobs',
      });
    }

    const newJob = new Job({
      clientId: req.user!.id,
      title,
      description,
      category,
      subcategory,
      jobType,
      budget: {
        jobType: budget.jobType,
        amount: budget.amount,
        hourlyRate: budget.hourlyRate,
        currency: budget.currency || 'USD',
      },
      duration: {
        estimate: duration?.estimate || 'Not specified',
        startDate: duration?.startDate,
        endDate: duration?.endDate,
      },

      skillsRequired: (skillsRequired || []).filter(
        (s: string) => s && s.trim() !== ''
      ),
      experienceLevel,
      attachments: attachments || [],
      status, // ✅ no "draft" fallback
      visibility: visibility || 'public',
      invitedFreelancers: invitedFreelancers || [],
      publishedAt: status === 'published' ? new Date() : undefined,
    });

    const savedJob = await newJob.save();

    if (savedJob.status === 'published' && savedJob.visibility === 'public') {
      try {
        type UserIdOnly = { _id: mongoose.Types.ObjectId };

        const freelancers = await User.find<UserIdOnly>({
          role: 'freelancer',
          isActive: true,
        }).select('_id');

        if (freelancers.length > 0) {
          const freelancerIds = freelancers.map((f) => f._id.toString());

          // Send notifications to all freelancers
          const result = await notificationService.sendToMultipleUsers(
            freelancerIds,
            {
              type: 'job_posted',
              title: 'New Job Posted',
              body: `A new ${jobType} job "${title}" has been posted in ${category}`,
              data: {
                jobId: savedJob._id,
                title: title,
                category: category,
                jobType: jobType,
                budget: budget,
              },
              fromUserId: req.user!.id,
            }
          );
        }
      } catch (notificationError) {
        console.error('Error sending job notifications:', notificationError);
        // Don't fail job creation if notification fails
      }
    }

    // Update client's job history
    await User.findByIdAndUpdate(req.user!.id, {
      $push: { 'clientProfile.jobHistory': savedJob._id },
    });

    const populatedJob = await Job.findById(savedJob._id).populate(
      'clientId',
      'name UserName email clientProfile.companyName'
    );

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: populatedJob,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// PUT /api/jobs/jobupdate/:id - Update job (Client only, own jobs)
export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find job and check ownership
    const existingJob = await Job.findById(id);
    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (existingJob.clientId.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own jobs',
      });
    }

    // Don't allow updating completed or cancelled jobs
    if (
      existingJob.status === 'completed' ||
      existingJob.status === 'cancelled'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed or cancelled jobs',
      });
    }

    // Handle publishing
    if (
      updateData.status === 'published' &&
      existingJob?.status !== 'published'
    ) {
      updateData.publishedAt = new Date();
    }

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('clientId', 'name UserName email clientProfile.companyName');

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// DELETE /api/jobs/jobdelete/:id - Delete job (Client only, own jobs)
export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Find job and check ownership
    const existingJob = await Job.findById(id);
    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (existingJob.clientId.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own jobs',
      });
    }

    // Don't allow deleting jobs with active proposals or in progress
    if (existingJob.status === 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete jobs that are in progress',
      });
    }

    if (existingJob.proposalCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          'Cannot delete jobs with existing proposals. Cancel the job instead.',
      });
    }

    await Job.findByIdAndDelete(id);

    // Remove from client's job history
    await User.findByIdAndUpdate(req.user!.id, {
      $pull: { 'clientProfile.jobHistory': id },
    });

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

interface JobRequestBody {
  title: string;
  category: string;
  subcategory: string;
  type: string;
}
// GET AI DESCRIPTION AND SKILL REQUIRED OF JOB
export const generateJobDetailsController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const body = req.body as unknown as JobRequestBody; // 👈 Explicit cast

    const { title, category, subcategory, type } = body;

    if (!title || !category || !subcategory || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let result;
    try {
      result = await generateJobDetailsAI(title, category, subcategory, type);
    } catch (error) {
      throw new Error('Error in genrating AI job details');
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error generating job details:', error);
    return res.status(500).json({ message: 'Failed to generate job details' });
  }
};
