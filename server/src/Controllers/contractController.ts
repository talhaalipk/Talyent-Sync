// src/Controllers/contractController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Contract, IContract } from '../Models/Contract';
import { Job } from '../Models/job';
import { User } from '../Models/user';
import { Proposal } from '../Models/proposal';
import { Wallet } from '../Models/Wallet';
import { AuthRequest } from '../Middleware/auth';
import { notificationService } from '../services/notificationService';
import { sendEmail } from '../services/emailService';

// Helper function to populate contract data based on user role
const getContractPopulation = (role: string) => {
  const basePopulation = [
    {
      path: 'jobId',
      select:
        'title description category subcategory jobType budget duration skillsRequired experienceLevel status',
    },
    {
      path: 'proposalId',
      select: 'proposalDesc bidAmount estimatedDelivery',
    },
  ];

  if (role === 'freelancer') {
    basePopulation.push({
      path: 'clientId',
      select:
        'name UserName email profilePic clientProfile.companyName clientProfile.companyDescription clientProfile.location clientProfile.clientRating',
    });
  } else if (role === 'client') {
    basePopulation.push({
      path: 'freelancerId',
      select:
        'name UserName email profilePic freelancerProfile.bio_desc freelancerProfile.location freelancerProfile.skills freelancerProfile.hourlyRate freelancerProfile.ratingAvg freelancerProfile.successRate',
    });
  } else {
    // For admin or other roles, populate both
    basePopulation.push(
      {
        path: 'clientId',
        select: 'name UserName email profilePic clientProfile',
      },
      {
        path: 'freelancerId',
        select: 'name UserName email profilePic freelancerProfile',
      }
    );
  }

  return basePopulation;
};

// GET /api/contracts/active-jobs
export const getActiveJobs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    let query: any = {};

    // Filter based on user role
    if (userRole === 'freelancer') {
      query.freelancerId = userId;
    } else if (userRole === 'client') {
      query.clientId = userId;
    } else if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const contracts = await Contract.find(query)
      .populate(getContractPopulation(userRole))
      .sort({ createdAt: -1 });

    // Format response based on user role
    const formattedContracts = contracts.map((contract: any) => {
      const baseData = {
        _id: contract._id,
        jobId: contract.jobId,
        type: contract.type,
        totalAmount: contract.totalAmount,
        hourlyRate: contract.hourlyRate,
        status: contract.status,
        escrowBalance: contract.escrowBalance,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,
      };

      if (userRole === 'freelancer') {
        return {
          ...baseData,
          client: contract.clientId,
          proposal: contract.proposalId,
        };
      } else if (userRole === 'client') {
        return {
          ...baseData,
          freelancer: contract.freelancerId,
          proposal: contract.proposalId,
        };
      } else {
        return {
          ...baseData,
          client: contract.clientId,
          freelancer: contract.freelancerId,
          proposal: contract.proposalId,
        };
      }
    });

    res.status(200).json({
      success: true,
      contracts: formattedContracts,
      count: formattedContracts.length,
    });
  } catch (error: any) {
    console.error('Error fetching active jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active jobs',
      error: error.message,
    });
  }
};

// GET /api/contracts/active-job/:contractId
export const getActiveJobDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(contractId)) {
      return res.status(400).json({ message: 'Invalid contract ID' });
    }

    // Build query based on user role
    let query: any = { _id: contractId };

    if (userRole === 'freelancer') {
      query.freelancerId = userId;
    } else if (userRole === 'client') {
      query.clientId = userId;
    } else if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const contract = await Contract.findOne(query).populate(
      getContractPopulation(userRole)
    );

    if (!contract) {
      return res
        .status(404)
        .json({ message: 'Contract not found or access denied' });
    }

    res.status(200).json({
      success: true,
      contract,
    });
  } catch (error: any) {
    console.error('Error fetching contract details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contract details',
      error: error.message,
    });
  }
};

// POST /api/contracts/active-job/:contractId/add-timesheet
export const addTimesheet = async (req: AuthRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const { title, description, hoursWork } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (userRole !== 'freelancer') {
      return res
        .status(403)
        .json({ message: 'Only freelancers can add timesheets' });
    }

    if (!mongoose.Types.ObjectId.isValid(contractId)) {
      return res.status(400).json({ message: 'Invalid contract ID' });
    }

    // Validation
    if (!title || !description || !hoursWork || hoursWork <= 0) {
      return res.status(400).json({
        message: 'Title, description, and valid hours worked are required',
      });
    }

    const contract = await Contract.findOne({
      _id: contractId,
      freelancerId: userId,
      type: 'hourly',
      status: 'active',
    }).populate('clientId', 'name email');

    if (!contract) {
      return res.status(404).json({
        message: 'Hourly contract not found or not accessible',
      });
    }

    // Add timesheet entry
    const timesheetEntry = {
      title: title.trim(),
      description: description.trim(),
      hoursWork: Number(hoursWork),
      status: 'awaiting_approval' as const,
      completedAt: new Date(),
    };

    contract.Hourtract = contract.Hourtract || [];
    contract.Hourtract.push(timesheetEntry);

    await contract.save();

    // Send notification to client
    const clientUser = contract.clientId as any;
    await notificationService.sendNotification({
      userId: clientUser._id.toString(),
      type: 'proposal_status_change',
      title: 'New Timesheet Submitted',
      body: `${req.user?.id} submitted ${hoursWork} hours for "${title}"`,
      data: {
        contractId: contract._id,
        timesheetEntry,
        type: 'timesheet_submitted',
      },
      relatedId: (contract._id as mongoose.Types.ObjectId).toString(),
      fromUserId: userId,
    });

    // Send email notification
    try {
      await sendEmail(
        clientUser.email,
        'New Timesheet Submitted',
        `
        <h3>New Timesheet Submitted</h3>
        <p><strong>Project:</strong> ${title}</p>
        <p><strong>Hours:</strong> ${hoursWork}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p>Please review and approve the timesheet in your dashboard.</p>
        `
      );
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Timesheet added successfully',
      timesheetEntry,
    });
  } catch (error: any) {
    console.error('Error adding timesheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add timesheet',
      error: error.message,
    });
  }
};

// PATCH /api/contracts/active-job/:contractId/timesheet-approval
export const updateTimesheetStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { contractId } = req.params;
    const { timesheetId, status, rejectionReason } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (userRole !== 'client') {
      return res
        .status(403)
        .json({ message: 'Only clients can approve/reject timesheets' });
    }

    if (!mongoose.Types.ObjectId.isValid(contractId)) {
      return res.status(400).json({ message: 'Invalid contract ID' });
    }

    if (!['approved', 'reject'].includes(status)) {
      return res
        .status(400)
        .json({ message: 'Status must be "approved" or "reject"' });
    }

    const contract = await Contract.findOne({
      _id: contractId,
      clientId: userId,
      type: 'hourly',
    }).populate('freelancerId', 'name email');

    if (!contract) {
      return res.status(404).json({
        message: 'Hourly contract not found or not accessible',
      });
    }

    // Find and update the timesheet entry
    const timesheetEntry = contract.Hourtract?.find(
      (entry: any) => entry._id.toString() === timesheetId
    );

    if (!timesheetEntry) {
      return res.status(404).json({ message: 'Timesheet entry not found' });
    }

    if (timesheetEntry.status !== 'awaiting_approval') {
      return res.status(400).json({
        message: 'Timesheet has already been processed',
      });
    }

    // Update timesheet status
    timesheetEntry.status = status;
    timesheetEntry.approvedAt = new Date();

    await contract.save();

    // Handle payment for approved timesheets
    if (status === 'approved' && contract.hourlyRate) {
      const paymentAmount = timesheetEntry.hoursWork * contract.hourlyRate;

      try {
        await processTimesheetPayment(
          (contract._id as mongoose.Types.ObjectId).toString(),
          contract.clientId.toString(),
          contract.freelancerId.toString(),
          paymentAmount,
          `Payment for ${timesheetEntry.hoursWork} hours - ${timesheetEntry.title}`
        );
      } catch (paymentError) {
        console.error('Payment processing error:', paymentError);
      }
    }

    // Send notification to freelancer
    const freelancerUser = contract.freelancerId as any;
    await notificationService.sendNotification({
      userId: freelancerUser._id.toString(),
      type: 'proposal_status_change',
      title: `Timesheet ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      body: `Your timesheet "${timesheetEntry.title}" has been ${status}${rejectionReason ? `: ${rejectionReason}` : ''}`,
      data: {
        contractId: contract._id,
        timesheetEntry,
        type: 'timesheet_' + status,
        rejectionReason,
      },
      relatedId: (contract._id as mongoose.Types.ObjectId).toString(),
      fromUserId: userId,
    });

    // Send email notification
    try {
      await sendEmail(
        freelancerUser.email,
        `Timesheet ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        `
        <h3>Timesheet ${status === 'approved' ? 'Approved' : 'Rejected'}</h3>
        <p><strong>Project:</strong> ${timesheetEntry.title}</p>
        <p><strong>Hours:</strong> ${timesheetEntry.hoursWork}</p>
        <p><strong>Status:</strong> ${status}</p>
        ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
        ${
          status === 'approved' && contract.hourlyRate
            ? `<p><strong>Payment:</strong> $${(timesheetEntry.hoursWork * contract.hourlyRate).toFixed(2)}</p>`
            : ''
        }
        `
      );
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: `Timesheet ${status} successfully`,
      timesheetEntry,
    });
  } catch (error: any) {
    console.error('Error updating timesheet status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update timesheet status',
      error: error.message,
    });
  }
};

// PATCH /api/contracts/active-job/:contractId/request-completion
export const requestContractCompletion = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { contractId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (userRole !== 'freelancer') {
      return res
        .status(403)
        .json({ message: 'Only freelancers can request completion' });
    }

    if (!mongoose.Types.ObjectId.isValid(contractId)) {
      return res.status(400).json({ message: 'Invalid contract ID' });
    }

    const contract = await Contract.findOne({
      _id: contractId,
      freelancerId: userId,
      status: 'active',
    })
      .populate('clientId', 'name email')
      .populate('jobId', 'title');

    if (!contract) {
      return res.status(404).json({
        message: 'Active contract not found or not accessible',
      });
    }

    // Update contract status
    contract.status = 'awaiting_approval';
    await contract.save();

    // Send notification to client
    const clientUser = contract.clientId as any;
    const job = contract.jobId as any;

    await notificationService.sendNotification({
      userId: clientUser._id.toString(),
      type: 'job_completed',
      title: 'Project Completion Request',
      body: `Freelancer has requested completion for "${job.title}"`,
      data: {
        contractId: contract._id,
        type: 'completion_requested',
      },
      relatedId: (contract._id as mongoose.Types.ObjectId).toString(),
      fromUserId: userId,
    });

    // Send email notification
    try {
      await sendEmail(
        clientUser.email,
        'Project Completion Request',
        `
        <h3>Project Completion Request</h3>
        <p>The freelancer has completed the work for "<strong>${job.title}</strong>" and is requesting your approval.</p>
        <p>Please review the work and approve or request changes in your dashboard.</p>
        `
      );
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Completion request submitted successfully',
    });
  } catch (error: any) {
    console.error('Error requesting completion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request completion',
      error: error.message,
    });
  }
};

// PATCH /api/contracts/active-job/:contractId/completion-response
export const handleCompletionResponse = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    console.log('🔹 handleCompletionResponse called');
    const { contractId } = req.params;
    const { action, feedback } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // ... your validation code stays the same ...

    console.log('🔍 Finding contract...');
    const contract = await Contract.findOne({
      _id: contractId,
      clientId: userId,
      status: 'awaiting_approval',
    })
      .populate('freelancerId', 'name email')
      .populate('jobId', 'title');

    if (!contract) {
      return res.status(404).json({
        message: 'Contract not found or not awaiting approval',
      });
    }

    const freelancerUser = contract.freelancerId as any;
    const actualFreelancerId = freelancerUser._id.toString();
    const job = contract.jobId as any;

    // Handle payment if accepted
    if (action === 'accept') {
      let paymentAmount = 0;

      if (contract.type === 'fixed' && contract.totalAmount) {
        paymentAmount = contract.totalAmount;
      } else if (contract.type === 'hourly' && contract.totalAmount) {
        paymentAmount = contract.totalAmount;
      }

      // else if (contract.type === 'hourly' && contract.Hourtract) {
      //     const approvedHours = contract.Hourtract
      //         .filter((entry: any) => entry.status === 'approved')
      //         .reduce((total: number, entry: any) => total + entry.hoursWork, 0);
      //     paymentAmount = approvedHours * (contract.hourlyRate || 0);
      // }

      if (paymentAmount > 0) {
        try {
          await processContractPaymentSimple(
            contractId,
            contract.clientId.toString(),
            actualFreelancerId,
            paymentAmount,
            `Contract completion payment - ${job.title}`
          );

          console.log('📤 Sending payment notifications...');

          // Notification to freelancer (payment received)
          await notificationService.sendNotification({
            userId: actualFreelancerId,
            type: 'payment_received',
            title: 'Payment Received!',
            body: `You received $${paymentAmount.toFixed(2)} for "${job.title}"`,
            data: {
              contractId: contract._id,
              amount: paymentAmount,
              type: 'payment_received',
            },
            relatedId: (contract._id as mongoose.Types.ObjectId).toString(),
            fromUserId: userId,
          });

          // Notification to client (payment processed)
          await notificationService.sendNotification({
            userId: contract.clientId.toString(),
            type: 'payment_received',
            title: 'Payment Processed',
            body: `Payment of $${paymentAmount.toFixed(2)} has been released for "${job.title}"`,
            data: {
              contractId: contract._id,
              amount: paymentAmount,
              type: 'payment_processed',
            },
            relatedId: (contract._id as mongoose.Types.ObjectId).toString(),
            fromUserId: userId,
          });

          // Email to freelancer
          try {
            await sendEmail(
              freelancerUser.email,
              'Payment Received - Project Completed',
              `
                            <h3>Payment Received!</h3>
                            <p>Congratulations! You have received payment for your completed work.</p>
                            <p><strong>Project:</strong> ${job.title}</p>
                            <p><strong>Amount:</strong> $${paymentAmount.toFixed(2)}</p>
                            <p>The payment has been added to your available balance and you can withdraw it anytime.</p>
                            `
            );
          } catch (emailError) {
            console.error(
              'Failed to send freelancer payment email:',
              emailError
            );
          }

          // Email to client
          try {
            const clientUser = await User.findById(contract.clientId).select(
              'email name'
            );
            if (clientUser) {
              await sendEmail(
                clientUser.email,
                'Payment Processed - Project Completed',
                `
                    <h3>Payment Processed</h3>
                    <p>Your payment has been successfully processed and released to the freelancer.</p>
                    <p><strong>Project:</strong> ${job.title}</p>
                    <p><strong>Amount:</strong> $${paymentAmount.toFixed(2)}</p>
                    <p><strong>Freelancer:</strong> ${freelancerUser.name || freelancerUser.email}</p>
                    <p>Thank you for using our platform!</p>
                    `
              );
            }
          } catch (emailError) {
            console.error('Failed to send client payment email:', emailError);
          }

          console.log('✅ Payment notifications sent successfully');
        } catch (paymentError: any) {
          return res.status(500).json({
            success: false,
            message: 'Payment processing failed.',
            error: paymentError.message,
          });
        }
      }
    }

    // Update contract status
    contract.status = action === 'accept' ? 'completed' : 'disputed';
    await contract.save();

    if (action === 'accept') {
      await Job.findByIdAndUpdate(contract.jobId, { status: 'completed' });
    }

    // ... rest of your notification code stays the same ...

    res.status(200).json({
      success: true,
      message: `Contract ${action === 'accept' ? 'completed' : 'disputed'} successfully`,
    });
  } catch (error: any) {
    console.error('❌ Error handling completion response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process completion response',
      error: error.message,
    });
  }
};

// Helper function to process timesheet payments
const processTimesheetPayment = async (
  contractId: string,
  clientId: string,
  freelancerId: string,
  amount: number,
  note: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get wallets
    const clientWallet = await Wallet.findOne({ userId: clientId }).session(
      session
    );
    const freelancerWallet = await Wallet.findOne({
      userId: freelancerId,
    }).session(session);

    if (!clientWallet || !freelancerWallet) {
      throw new Error('Wallet not found');
    }

    // Check if client has sufficient escrow balance in the contract
    const contract = await Contract.findById(contractId).session(session);
    if (!contract || contract.escrowBalance < amount) {
      throw new Error('Insufficient escrow balance');
    }

    // Update contract escrow balance
    contract.escrowBalance -= amount;
    await contract.save({ session });

    // Update client wallet (escrow release)
    clientWallet.ledger.push({
      type: 'escrow_released',
      amount: -amount,
      contractId: new mongoose.Types.ObjectId(contractId),
      note,
      createdAt: new Date(),
    });

    // Update freelancer wallet
    freelancerWallet.availableBalance += amount;
    freelancerWallet.totalEarning =
      (freelancerWallet.totalEarning || 0) + amount;
    freelancerWallet.ledger.push({
      type: 'escrow_released',
      amount: +amount,
      contractId: new mongoose.Types.ObjectId(contractId),
      note,
      createdAt: new Date(),
    });

    await clientWallet.save({ session });
    await freelancerWallet.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


const processContractPaymentSimple = async (
  contractId: string,
  clientId: string,
  freelancerId: string,
  amount: number,
  note: string
) => {
  const clientObjectId = new mongoose.Types.ObjectId(clientId);
  const freelancerObjectId = new mongoose.Types.ObjectId(freelancerId);
  const contractObjectId = new mongoose.Types.ObjectId(contractId);

  const clientWallet = await Wallet.findOne({ userId: clientObjectId });
  const freelancerWallet = await Wallet.findOne({ userId: freelancerObjectId });
  const contract = await Contract.findById(contractObjectId);

  if (!clientWallet || !freelancerWallet || !contract) {
    throw new Error('Wallet or contract not found');
  }

  if (contract.escrowBalance < amount) {
    throw new Error(`Insufficient escrow balance`);
  }

  // Update contract
  contract.escrowBalance -= amount;
  await contract.save();

  // Update wallets
  clientWallet.pendingBalance -= amount;
  clientWallet.ledger.push({
    type: 'escrow_released',
    amount: -amount,
    contractId: contractObjectId,
    note,
    createdAt: new Date(),
  });

  freelancerWallet.availableBalance += amount;
  freelancerWallet.pendingBalance -= amount;
  freelancerWallet.totalEarning = (freelancerWallet.totalEarning || 0) + amount;
  freelancerWallet.ledger.push({
    type: 'escrow_released',
    amount: +amount,
    contractId: contractObjectId,
    note,
    createdAt: new Date(),
  });

  await clientWallet.save();
  await freelancerWallet.save();
};
