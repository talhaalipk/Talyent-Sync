// src/Controllers/Admin/disputeController.ts
import { Response } from 'express';
import mongoose from 'mongoose';
import { Contract } from '../../Models/Contract';
import { User } from '../../Models/user';
import { Job } from '../../Models/job';
import { Wallet } from '../../Models/Wallet';
import { AdminAuthRequest } from '../../Middleware/Admin/adminAuth';
import { notificationService } from '../../services/notificationService';

// GET /api/admin/dashboard/disputes - Get all disputed contracts
export const getDisputedContracts = async (
  req: AdminAuthRequest,
  res: Response
) => {
  try {
    const disputedContracts = await Contract.find({ status: 'disputed' })
      .populate('clientId', 'UserName email profilePic')
      .populate('freelancerId', 'UserName email profilePic')
      .populate('jobId', 'title')
      .select(
        'clientId freelancerId jobId type totalAmount escrowBalance createdAt'
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      contracts: disputedContracts,
      count: disputedContracts.length,
    });
  } catch (error: any) {
    console.error('Error fetching disputed contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch disputed contracts',
    });
  }
};

// GET /api/admin/dashboard/disputes/:contractId - Get specific dispute details
export const getDisputeDetails = async (
  req: AdminAuthRequest,
  res: Response
) => {
  try {
    const { contractId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contractId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID',
      });
    }

    const contract = await Contract.findById(contractId)
      .populate('clientId', 'UserName email profilePic clientProfile')
      .populate('freelancerId', 'UserName email profilePic freelancerProfile')
      .populate('jobId', 'title description category skillsRequired');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found',
      });
    }

    if (contract.status !== 'disputed') {
      return res.status(400).json({
        success: false,
        message: 'Contract is not in disputed status',
      });
    }

    res.status(200).json({
      success: true,
      contract,
    });
  } catch (error: any) {
    console.error('Error fetching dispute details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dispute details',
    });
  }
};

// POST /api/admin/dashboard/disputes/:contractId/resolve-to-freelancer
export const resolveToFreelancer = async (
  req: AdminAuthRequest,
  res: Response
) => {
  try {
    const { contractId } = req.params;
    const { note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(contractId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID',
      });
    }

    const contract = await Contract.findById(contractId)
      .populate('jobId', 'title')
      .populate('clientId', 'UserName email')
      .populate('freelancerId', 'UserName email');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found',
      });
    }

    if (contract.status !== 'disputed') {
      return res.status(400).json({
        success: false,
        message: 'Contract is not in disputed status',
      });
    }

    const paymentAmount = contract.totalAmount || 0;

    // Update client wallet
    const clientWallet = await Wallet.findOne({ userId: contract.clientId });
    if (clientWallet) {
      clientWallet.pendingBalance -= paymentAmount;
      clientWallet.ledger.push({
        type: 'refund',
        amount: -paymentAmount,
        contractId: contract._id as mongoose.Types.ObjectId,
        note: note || 'Dispute resolved in favor of freelancer by admin',
        createdAt: new Date(),
      });
      await clientWallet.save();
    }

    // Update freelancer wallet
    const freelancerWallet = await Wallet.findOne({
      userId: contract.freelancerId,
    });
    if (freelancerWallet) {
      freelancerWallet.pendingBalance -= paymentAmount;
      freelancerWallet.totalEarning =
        (freelancerWallet?.totalEarning || 0) + paymentAmount;
      freelancerWallet.availableBalance += paymentAmount;
      freelancerWallet.ledger.push({
        type: 'refund',
        amount: paymentAmount,
        contractId: contract._id as mongoose.Types.ObjectId,
        note: note || 'Dispute resolved in your favor by admin',
        createdAt: new Date(),
      });
      await freelancerWallet.save();
    }

    // Update contract status
    contract.status = 'admin_approved';
    contract.escrowBalance = 0;
    await contract.save();

    // Send notifications
    const job = contract.jobId as any;
    console.log('Job details for notification:', job);
    // Notify client
    await notificationService.sendNotification({
      userId: contract.clientId.toString(),
      type: 'refund_amonunt_by_Admin',
      title: 'Dispute Resolved',
      body: `Admin resolved the dispute for "${job?.title}" in favor of the freelancer. Payment of $${paymentAmount?.toFixed(2)} has been released to the freelancer.`,
      data: {
        contractId: contract._id,
        amount: paymentAmount,
        type: 'dispute_resolved_client',
        winner: 'freelancer',
      },
      relatedId: (contract._id as mongoose.Types.ObjectId).toString(),
      fromUserId: req.admin!.id.toString(),
    });

    // Notify freelancer
    await notificationService.sendNotification({
      userId: contract.freelancerId.toString(),
      type: 'refund_amonunt_by_Admin',
      title: 'Dispute Resolved in Your Favor',
      body: `Admin resolved the dispute for "${job.title}" in your favor. Payment of $${paymentAmount.toFixed(2)} has been released to your account.`,
      data: {
        contractId: contract._id,
        amount: paymentAmount,
        type: 'dispute_resolved_freelancer',
        winner: 'freelancer',
      },
      relatedId: (contract._id as mongoose.Types.ObjectId).toString(),
      fromUserId: req.admin!.id.toString(),
    });

    res.status(200).json({
      success: true,
      message: 'Dispute resolved in favor of freelancer successfully',
      paymentAmount,
      contract: {
        id: contract._id,
        status: contract.status,
      },
    });
  } catch (error: any) {
    console.error('Error resolving dispute to freelancer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve dispute',
    });
  }
};

// POST /api/admin/dashboard/disputes/:contractId/resolve-to-client
export const resolveToClient = async (req: AdminAuthRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const { note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(contractId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID',
      });
    }

    const contract = await Contract.findById(contractId)
      .populate('jobId', 'title')
      .populate('clientId', 'UserName email')
      .populate('freelancerId', 'UserName email');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found',
      });
    }

    if (contract.status !== 'disputed') {
      return res.status(400).json({
        success: false,
        message: 'Contract is not in disputed status',
      });
    }

    const paymentAmount = contract.totalAmount || 0;

    // Update client wallet
    const clientWallet = await Wallet.findOne({ userId: contract.clientId });
    if (clientWallet) {
      clientWallet.availableBalance += paymentAmount;
      clientWallet.pendingBalance -= paymentAmount;
      clientWallet.ledger.push({
        type: 'refund',
        amount: paymentAmount,
        contractId: contract._id as mongoose.Types.ObjectId,
        note: note || 'Dispute resolved in your favor by admin',
        createdAt: new Date(),
      });
      await clientWallet.save();
    }

    // Update freelancer wallet
    const freelancerWallet = await Wallet.findOne({
      userId: contract.freelancerId,
    });
    if (freelancerWallet) {
      freelancerWallet.pendingBalance -= paymentAmount;
      freelancerWallet.ledger.push({
        type: 'refund',
        amount: -paymentAmount,
        contractId: contract._id as mongoose.Types.ObjectId,
        note: note || 'Dispute resolved in favor of client by admin',
        createdAt: new Date(),
      });
      await freelancerWallet.save();
    }

    // Update contract status
    contract.status = 'admin_approved';
    contract.escrowBalance = 0;
    await contract.save();

    // Send notifications
    const job = contract.jobId as any;

    // Notify client
    await notificationService.sendNotification({
      userId: contract.clientId.toString(),
      type: 'refund_amonunt_by_Admin',
      title: 'Dispute Resolved in Your Favor',
      body: `Admin resolved the dispute for "${job.title}" in your favor. Refund of $${paymentAmount.toFixed(2)} has been added to your account.`,
      data: {
        contractId: contract._id,
        amount: paymentAmount,
        type: 'dispute_resolved_client',
        winner: 'client',
      },
      relatedId: (contract._id as mongoose.Types.ObjectId).toString(),
      fromUserId: req.admin!.id.toString(),
    });

    // Notify freelancer
    await notificationService.sendNotification({
      userId: contract.freelancerId.toString(),
      type: 'refund_amonunt_by_Admin',
      title: 'Dispute Resolved',
      body: `Admin resolved the dispute for "${job.title}" in favor of the client. The escrowed amount has been refunded to the client.`,
      data: {
        contractId: contract._id,
        amount: paymentAmount,
        type: 'dispute_resolved_freelancer',
        winner: 'client',
      },
      relatedId: (contract._id as mongoose.Types.ObjectId).toString(),
      fromUserId: req.admin!.id.toString(),
    });

    res.status(200).json({
      success: true,
      message: 'Dispute resolved in favor of client successfully',
      paymentAmount,
      contract: {
        id: contract._id,
        status: contract.status,
      },
    });
  } catch (error: any) {
    console.error('Error resolving dispute to client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve dispute',
    });
  }
};
