import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Proposal, IProposal } from '../Models/proposal';
import { Job } from '../Models/job';
import { User } from '../Models/user';
import { AuthRequest } from '../Middleware/auth';
import { sendProposalNotificationEmail } from '../services/emailService';
import { sendProposalStatusEmail } from '../services/emailService';
import { Wallet } from '../Models/Wallet';
import { Contract, IContract } from '../Models/Contract';
import { sendEmail } from '../services/emailService';
import { notificationService } from '../services/notificationService';

// @desc Send a new proposal
// @route POST /api/proposals/send
// @access Private (Freelancer only)
export const sendProposal = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, proposalDesc, portfolio, bidAmount, estimatedDelivery } =
      req.body;
    const senderId = req.user?.id;

    if (!jobId || !proposalDesc) {
      return res.status(400).json({
        success: false,
        message: 'Job ID and proposal description are required',
      });
    }

    const job = await Job.findById(jobId).populate('clientId');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot propose to a job that is not published',
      });
    }

    if (job.clientId.toString() === senderId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot propose to your own job',
      });
    }

    const existingProposal = await Proposal.findOne({ jobId, senderId });
    if (existingProposal) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a proposal for this job',
      });
    }

    let documentUrl: string | null = null;
    if (req.file) {
      documentUrl = req.file.path;
    }

    const freelancer = await User.findById(senderId);
    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer not found',
      });
    }

    const newProposal = new Proposal({
      jobId,
      senderId,
      receiverId: job.clientId,
      proposalDesc,
      portfolio: portfolio || [],
      document: documentUrl,
      bidAmount,
      estimatedDelivery,
      status: 'pending',
    });

    await newProposal.save();

    // ✅ NEW FEATURE: increase proposal count
    await Job.findByIdAndUpdate(jobId, { $inc: { proposalCount: 1 } });

    const client = job.clientId as any;
    if (client && client.email) {
      await sendProposalNotificationEmail(client, freelancer, job, newProposal);
    }

    await newProposal.populate(
      'senderId',
      'name UserName profilePic freelancerProfile.ratingAvg'
    );

    return res.status(201).json({
      success: true,
      message: 'Proposal sent successfully',
      data: newProposal,
    });
  } catch (error: any) {
    console.error('Send proposal error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a proposal for this job',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while sending proposal',
    });
  }
};

// @desc Update proposal (for freelancers to edit or withdraw)
// @route PUT /api/proposals/:id
// @access Private (Sender only)
export const updateProposal = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updates = req.body;

    const proposal = await Proposal.findById(id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found',
      });
    }

    // Check if user is the sender
    if (proposal.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this proposal',
      });
    }

    // Only allow updates if proposal is pending
    if (proposal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only update pending proposals',
      });
    }

    // Handle document update (if new file was uploaded)
    let documentUrl = proposal.document; // Keep existing document
    if (req.file) {
      documentUrl = req.file.path; // New Cloudinary URL
    }

    // Allowed fields for update
    const allowedUpdates = [
      'proposalDesc',
      'portfolio',
      'bidAmount',
      'estimatedDelivery',
      'status',
    ];
    const updateData: any = {};

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    // Always update document URL (either new or existing)
    updateData.document = documentUrl;

    // If status is being changed to withdrawn, decrease job proposal count
    if (updates.status === 'withdrawn') {
      await Job.findByIdAndUpdate(proposal.jobId, {
        $inc: { proposalCount: -1 },
      });
    }

    const updatedProposal = await Proposal.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate(
        'senderId',
        'name UserName profilePic freelancerProfile.ratingAvg'
      )
      .populate('jobId', 'title budget jobType');

    res.status(200).json({
      success: true,
      message: 'Proposal updated successfully',
      data: updatedProposal,
    });
  } catch (error) {
    console.error('Update proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating proposal',
    });
  }
};

// ===== KEEP ALL OTHER EXISTING FUNCTIONS UNCHANGED =====
export const getProposalsByReceiverId = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const receiverId = req.user?.id;
    const { jobId, status, page = 1, limit = 10 } = req.query;

    const filter: any = { receiverId };

    if (jobId) filter.jobId = jobId;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const proposals = await Proposal.find(filter)
      .populate('senderId', 'name UserName profilePic freelancerProfile')
      .populate('jobId', 'title budget jobType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Proposal.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: proposals,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        count: proposals.length,
        totalProposals: total,
      },
    });
  } catch (error) {
    console.error('Get received proposals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching received proposals',
    });
  }
};

export const getProposalsBySenderId = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const senderId = req.user?.id;
    const { status, page = 1, limit = 10 } = req.query;

    const filter: any = { senderId };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const proposals = await Proposal.find(filter)
      .populate(
        'receiverId',
        'name UserName profilePic clientProfile.companyName'
      )
      .populate('jobId', 'title budget jobType status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Proposal.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: proposals,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        count: proposals.length,
        totalProposals: total,
      },
    });
  } catch (error) {
    console.error('Get sent proposals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sent proposals',
    });
  }
};

export const getProposalById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const proposal = await Proposal.findById(id)
      .populate('senderId', 'name UserName profilePic freelancerProfile')
      .populate(
        'receiverId',
        'name UserName profilePic clientProfile.companyName'
      )
      .populate('jobId');

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found',
      });
    }

    if (
      (proposal.senderId as any)._id.toString() !== userId &&
      (proposal.receiverId as any)._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this proposal',
      });
    }

    res.status(200).json({
      success: true,
      data: proposal,
    });
  } catch (error) {
    console.error('Get proposal by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching proposal',
    });
  }
};

export const updateProposalStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!['accepted', 'rejected', 'shortlisted'].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Use 'accepted' or 'rejected' or 'shortlisted'",
      });
    }

    const proposal = await Proposal.findById(id)
      .populate('senderId', 'name UserName profilePic email')
      .populate('jobId', 'title budget jobType');

    if (!proposal) {
      return res
        .status(404)
        .json({ success: false, message: 'Proposal not found' });
    }

    const job = proposal?.jobId as unknown as {
      _id: mongoose.Types.ObjectId;
      title: string;
    };
    const freelancer = proposal?.senderId as unknown as {
      _id: mongoose.Types.ObjectId;
      email: string;
      UserName: string;
    };
    const clientId = proposal?.receiverId as unknown as mongoose.Types.ObjectId;

    if (proposal.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this proposal status',
      });
    }

    if (proposal.status !== 'pending' && proposal.status !== 'shortlisted') {
      return res.status(400).json({
        success: false,
        message: 'Can only update pending proposals',
      });
    }

    // --------------------------
    // CASE: ACCEPTED
    // --------------------------
    if (status === 'accepted') {
      const clientWallet = await Wallet.findOne({
        userId: proposal.receiverId,
      });
      const freelancerWallet = await Wallet.findOne({
        userId: proposal.senderId,
      });

      if (!clientWallet || !freelancerWallet) {
        return res.status(400).json({
          success: false,
          message: 'Wallet not found for client or freelancer',
        });
      }

      // Calculate required amount
      let requiredAmount = 0;
      if ((proposal.jobId as any).jobType === 'fixed') {
        requiredAmount = proposal.bidAmount || 0;
      } else {
        const estimatedHours = proposal.estimatedDelivery
          ? parseInt(proposal.estimatedDelivery, 10)
          : 0;
        requiredAmount = (proposal.bidAmount || 0) * estimatedHours;
      }

      // Check balance
      if (clientWallet.availableBalance < requiredAmount) {
        return res.status(400).json({
          success: false,
          message: `You must have at least ${requiredAmount}$ in your available balance in Wallet`,
        });
      }

      // Create Contract

      const newContract: IContract = await Contract.create({
        jobId: proposal.jobId,
        clientId: proposal.receiverId,
        freelancerId: proposal.senderId,
        proposalId: proposal._id,
        type: (proposal.jobId as any).jobType,
        totalAmount: requiredAmount,
        status: 'active',
        escrowBalance: requiredAmount,
      });

      // Update Wallets
      clientWallet.availableBalance -= requiredAmount;
      clientWallet.pendingBalance += requiredAmount;
      clientWallet.ledger.push({
        type: 'escrow_funded',
        amount: -requiredAmount,
        contractId: newContract._id as mongoose.Types.ObjectId,
        note: 'Funds moved to escrow',
        createdAt: new Date(),
      });

      freelancerWallet.pendingBalance += requiredAmount;
      freelancerWallet.ledger.push({
        type: 'escrow_funded',
        amount: requiredAmount,
        contractId: newContract._id as mongoose.Types.ObjectId,
        note: 'Funds held in escrow',
        createdAt: new Date(),
      });

      await clientWallet.save();
      await freelancerWallet.save();

      // Increment job hiredCount
      await Job.findByIdAndUpdate(proposal.jobId, { $inc: { hiredCount: 1 } });

      // Finally update proposal status AFTER everything succeeded
      proposal.status = 'accepted';
      await proposal.save();

      // Send email
      const freelancer: any = proposal.senderId;
      const job: any = proposal.jobId;
      await sendEmail(
        freelancer.email,
        'Proposal Accepted - Contract Created',
        `<p>Congratulations! Your proposal for job <b>${job.title}</b> has been accepted. A contract has been created with an escrow balance of ${requiredAmount}.</p>`
      );

      console.log(proposal);

      try {
        await notificationService.sendNotification({
          userId: freelancer._id.toString(),
          type: 'proposal_accepted',
          title: 'proposal_accepted You have new job',
          body: `You received $${requiredAmount} for "${job.title}"`,
          data: {
            amount: requiredAmount,
            jobId: job._id.toString(),
            jobTitle: job.title,
          },
          relatedId: (newContract._id as IContract).toString(),
          fromUserId: clientId.toString(),
        });
        console.log('✅ Notification sent to freelancer');
      } catch (notifyErr: any) {
        console.log('⚠️ Notification error:', notifyErr.message);
      }
    }

    // --------------------------
    // CASE: REJECTED / SHORTLISTED
    // --------------------------
    if (status === 'rejected' || status === 'shortlisted') {
      console.log('listed ma ');
      proposal.status = status;
      await proposal.save();
      console.log(`✅ Proposal marked as ${status}`);
      try {
        await notificationService.sendNotification({
          userId: freelancer._id.toString(),
          type: 'proposal_status_change',
          title: 'proposal_status_change',
          body: `Your Proposal status change to ${status} for "${job.title}"`,
          fromUserId: clientId.toString(),
        });
        console.log('✅ Notification sent to freelancer 22');
      } catch (notifyErr: any) {
        console.log('⚠️ Notification error:', notifyErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Proposal ${status} successfully`,
      data: proposal,
    });
  } catch (error) {
    console.error('🔥 Update proposal status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating proposal status',
    });
  }
};

export const getProposalStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let stats: any = {};

    if (userRole === 'freelancer') {
      const sentStats = await Proposal.aggregate([
        { $match: { senderId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      stats.sent = {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0,
      };

      sentStats.forEach((stat) => {
        stats.sent[stat._id] = stat.count;
        stats.sent.total += stat.count;
      });

      stats.successRate =
        stats.sent.total > 0
          ? Math.round((stats.sent.accepted / stats.sent.total) * 100)
          : 0;
    } else if (userRole === 'client') {
      const receivedStats = await Proposal.aggregate([
        { $match: { receiverId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      stats.received = {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
      };

      receivedStats.forEach((stat) => {
        stats.received[stat._id] = stat.count;
        stats.received.total += stat.count;
      });
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get proposal stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching proposal statistics',
    });
  }
};
