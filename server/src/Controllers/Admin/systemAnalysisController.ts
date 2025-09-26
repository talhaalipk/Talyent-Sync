import { Response } from 'express';
import { User } from '../../Models/user';
import { Job } from '../../Models/job';
import { Proposal } from '../../Models/proposal';
import { Contract } from '../../Models/Contract';
import { Wallet } from '../../Models/Wallet';
import { AdminAuthRequest } from '../../Middleware/Admin/adminAuth';

// GET /api/admin/dashboard/system-analysis - Get system analytics
export const getSystemAnalysis = async (
  req: AdminAuthRequest,
  res: Response
) => {
  try {
    // User Analytics
    const totalUsers = await User.countDocuments({
      role: { $in: ['client', 'freelancer'] },
    });
    const totalFreelancers = await User.countDocuments({ role: 'freelancer' });
    const totalClients = await User.countDocuments({ role: 'client' });

    // Job Analytics
    const totalJobs = await Job.countDocuments();

    // Experience level breakdown
    const experienceLevels = await Job.aggregate([
      {
        $group: {
          _id: '$experienceLevel',
          count: { $sum: 1 },
        },
      },
    ]);

    // Category breakdown with hardcoded categories
    const categories = [
      'development-it',
      'design-creative',
      'writing-translation',
      'sales-marketing',
      'admin-support',
      'finance-business',
      'engineering-architecture',
      'lifestyle',
    ];

    const categoryBreakdown = await Job.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    // Ensure all categories are represented
    const categoryData = categories.map((category) => {
      const found = categoryBreakdown.find((item) => item._id === category);
      return {
        category,
        count: found ? found.count : 0,
      };
    });

    // Proposal Analytics
    const totalProposals = await Proposal.countDocuments();

    const proposalStatusBreakdown = await Proposal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Average bid amount with ranges
    const bidRanges = await Proposal.aggregate([
      {
        $match: { bidAmount: { $exists: true, $ne: null } },
      },
      {
        $bucket: {
          groupBy: '$bidAmount',
          boundaries: [0, 100, 500, 1000, 5000, 10000, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            avgBid: { $avg: '$bidAmount' },
          },
        },
      },
    ]);

    const averageBidAmount = await Proposal.aggregate([
      {
        $match: { bidAmount: { $exists: true, $ne: null } },
      },
      {
        $group: {
          _id: null,
          avgBid: { $avg: '$bidAmount' },
        },
      },
    ]);

    // Contract Analytics
    const totalContracts = await Contract.countDocuments();

    const contractStatusBreakdown = await Contract.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const contractTypeBreakdown = await Contract.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    const averageContractAmount = await Contract.aggregate([
      {
        $match: { totalAmount: { $exists: true, $ne: null } },
      },
      {
        $group: {
          _id: null,
          avgAmount: { $avg: '$totalAmount' },
        },
      },
    ]);

    // Escrow Analytics - Calculate total escrow in system
    const totalEscrowInSystem = await Contract.aggregate([
      {
        $group: {
          _id: null,
          totalEscrow: { $sum: '$escrowBalance' },
        },
      },
    ]);

    // Payment Analytics - Get total balances
    const totalSystemBalance = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalAvailable: { $sum: '$availableBalance' },
          totalPending: { $sum: '$pendingBalance' },
          totalEarnings: { $sum: '$totalEarning' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          freelancers: totalFreelancers,
          clients: totalClients,
          userTypeData: [
            { name: 'Freelancers', value: totalFreelancers },
            { name: 'Clients', value: totalClients },
          ],
        },
        jobs: {
          total: totalJobs,
          experienceLevels: experienceLevels.map((level) => ({
            level: level._id,
            count: level.count,
          })),
          categories: categoryData,
          experienceLevelData: experienceLevels.map((level) => ({
            name: level._id,
            value: level.count,
          })),
          categoryData: categoryData.map((cat) => ({
            name: cat.category.replace('-', ' '),
            value: cat.count,
          })),
        },
        proposals: {
          total: totalProposals,
          statusBreakdown: proposalStatusBreakdown.map((status) => ({
            status: status._id,
            count: status.count,
          })),
          averageBidAmount: averageBidAmount[0]?.avgBid || 0,
          bidRanges: bidRanges.map((range, index) => {
            const boundaries = [0, 100, 500, 1000, 5000, 10000, Infinity];
            const labels = [
              '$0-100',
              '$100-500',
              '$500-1K',
              '$1K-5K',
              '$5K-10K',
              '$10K+',
            ];
            return {
              range: labels[index] || 'Other',
              count: range.count,
              avgBid: range.avgBid,
            };
          }),
          statusData: proposalStatusBreakdown.map((status) => ({
            name: status._id,
            value: status.count,
          })),
        },
        contracts: {
          total: totalContracts,
          statusBreakdown: contractStatusBreakdown.map((status) => ({
            status: status._id,
            count: status.count,
          })),
          typeBreakdown: contractTypeBreakdown.map((type) => ({
            type: type._id,
            count: type.count,
          })),
          averageAmount: averageContractAmount[0]?.avgAmount || 0,
          statusData: contractStatusBreakdown.map((status) => ({
            name: status._id,
            value: status.count,
          })),
          typeData: contractTypeBreakdown.map((type) => ({
            name: type._id,
            value: type.count,
          })),
        },
        payments: {
          totalEscrowInSystem: totalEscrowInSystem[0]?.totalEscrow || 0,
          totalAvailableBalance: totalSystemBalance[0]?.totalAvailable || 0,
          totalPendingBalance: totalSystemBalance[0]?.totalPending || 0,
          totalEarnings: totalSystemBalance[0]?.totalEarnings || 0,
          escrowData: [
            {
              name: 'Escrow Balance',
              value: totalEscrowInSystem[0]?.totalEscrow || 0,
            },
            {
              name: 'Available Balance',
              value: totalSystemBalance[0]?.totalAvailable || 0,
            },
            {
              name: 'Pending Balance',
              value: totalSystemBalance[0]?.totalPending || 0,
            },
          ],
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching system analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system analysis data',
    });
  }
};
