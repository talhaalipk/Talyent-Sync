import { Response } from 'express';
import mongoose from 'mongoose';
import { Contract } from '../Models/Contract';
import { Proposal } from '../Models/proposal';
import { Wallet } from '../Models/Wallet';
import { AuthRequest } from '../Middleware/auth';

// GET /api/analytics/my-stats
export const getMyAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    let analytics;

    if (userRole === 'client') {
      analytics = await getClientAnalytics(userId);
    } else if (userRole === 'freelancer') {
      analytics = await getFreelancerAnalytics(userId);
    } else {
      return res
        .status(403)
        .json({ message: 'Analytics not available for this role' });
    }

    res.status(200).json({
      success: true,
      data: analytics,
      role: userRole,
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
};

// Client Analytics
const getClientAnalytics = async (clientId: string) => {
  try {
    // Total Contracts by Status
    const contractsByStatus = await Contract.aggregate([
      { $match: { clientId: new mongoose.Types.ObjectId(clientId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'fixed'] },
                { $ifNull: ['$totalAmount', 0] },
                0,
              ],
            },
          },
        },
      },
    ]);

    // Format contract stats
    const contractStats = {
      awaiting_approval: 0,
      active: 0,
      completed: 0,
      disputed: 0,
      total: 0,
      totalSpent: 0,
    };

    contractsByStatus.forEach((stat) => {
      contractStats[stat._id as keyof typeof contractStats] = stat.count;
      contractStats.total += stat.count;
      contractStats.totalSpent += stat.totalSpent;
    });

    // Project Success Rate
    const successRate =
      contractStats.total > 0
        ? parseFloat(
            ((contractStats.completed / contractStats.total) * 100).toFixed(1)
          )
        : 0;

    // Average Hourly Rates
    const hourlyRatesStats = await Contract.aggregate([
      {
        $match: {
          clientId: new mongoose.Types.ObjectId(clientId),
          type: 'hourly',
          hourlyRate: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          averageHourlyRate: { $avg: '$hourlyRate' },
          minRate: { $min: '$hourlyRate' },
          maxRate: { $max: '$hourlyRate' },
          totalHourlyContracts: { $sum: 1 },
        },
      },
    ]);

    // Average Fixed Job Rates
    const fixedRatesStats = await Contract.aggregate([
      {
        $match: {
          clientId: new mongoose.Types.ObjectId(clientId),
          type: 'fixed',
          totalAmount: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          averageFixedRate: { $avg: '$totalAmount' },
          minAmount: { $min: '$totalAmount' },
          maxAmount: { $max: '$totalAmount' },
          totalFixedContracts: { $sum: 1 },
        },
      },
    ]);

    // Monthly Contract Trends (Last 12 months)
    const monthlyTrends = await Contract.aggregate([
      {
        $match: {
          clientId: new mongoose.Types.ObjectId(clientId),
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          contracts: { $sum: 1 },
          spending: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'fixed'] },
                { $ifNull: ['$totalAmount', 0] },
                0,
              ],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return {
      contractStats,
      successRate,
      hourlyRates: hourlyRatesStats[0] || {
        averageHourlyRate: 0,
        minRate: 0,
        maxRate: 0,
        totalHourlyContracts: 0,
      },
      fixedRates: fixedRatesStats[0] || {
        averageFixedRate: 0,
        minAmount: 0,
        maxAmount: 0,
        totalFixedContracts: 0,
      },
      monthlyTrends,
    };
  } catch (error) {
    console.error('Error in getClientAnalytics:', error);
    throw error;
  }
};

// Freelancer Analytics
const getFreelancerAnalytics = async (freelancerId: string) => {
  try {
    // Wallet Stats
    const wallet = await Wallet.findOne({ userId: freelancerId });
    const walletStats = {
      availableBalance: wallet?.availableBalance || 0,
      pendingBalance: wallet?.pendingBalance || 0,
      totalEarnings: wallet?.totalEarning || 0,
      totalWithdrawn: wallet?.totalWithdraw || 0,
    };

    // Contract Stats
    const contractsByStatus = await Contract.aggregate([
      { $match: { freelancerId: new mongoose.Types.ObjectId(freelancerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalEarned: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                {
                  $cond: [
                    { $eq: ['$type', 'fixed'] },
                    { $ifNull: ['$totalAmount', 0] },
                    0,
                  ],
                },
                0,
              ],
            },
          },
        },
      },
    ]);

    const contractStats = {
      awaiting_approval: 0,
      active: 0,
      completed: 0,
      disputed: 0,
      total: 0,
      totalEarned: 0,
    };

    contractsByStatus.forEach((stat) => {
      contractStats[stat._id as keyof typeof contractStats] = stat.count;
      contractStats.total += stat.count;
      contractStats.totalEarned += stat.totalEarned;
    });

    // Job Success Rate
    const successRate =
      contractStats.total > 0
        ? parseFloat(
            ((contractStats.completed / contractStats.total) * 100).toFixed(1)
          )
        : 0;

    // Proposal to Hire Ratio
    const proposalStats = await Proposal.aggregate([
      { $match: { senderId: new mongoose.Types.ObjectId(freelancerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    let totalProposals = 0;
    let acceptedProposals = 0;

    proposalStats.forEach((stat) => {
      totalProposals += stat.count;
      if (stat._id === 'accepted') {
        acceptedProposals = stat.count;
      }
    });

    const proposalToHireRatio =
      totalProposals > 0
        ? parseFloat(((acceptedProposals / totalProposals) * 100).toFixed(1))
        : 0;
    // Monthly Earnings Trends (Last 12 months)
    const monthlyEarnings = await Contract.aggregate([
      {
        $match: {
          freelancerId: new mongoose.Types.ObjectId(freelancerId),
          status: 'completed',
          updatedAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' },
          },
          earnings: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'fixed'] },
                { $ifNull: ['$totalAmount', 0] },
                0,
              ],
            },
          },
          contracts: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Contract Type Distribution
    const contractTypeStats = await Contract.aggregate([
      { $match: { freelancerId: new mongoose.Types.ObjectId(freelancerId) } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          earnings: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                {
                  $cond: [
                    { $eq: ['$type', 'fixed'] },
                    { $ifNull: ['$totalAmount', 0] },
                    0,
                  ],
                },
                0,
              ],
            },
          },
        },
      },
    ]);

    return {
      walletStats,
      contractStats,
      successRate,
      proposalStats: {
        total: totalProposals,
        accepted: acceptedProposals,
        proposalToHireRatio: proposalToHireRatio,
      },
      monthlyEarnings,
      contractTypeStats,
    };
  } catch (error) {
    console.error('Error in getFreelancerAnalytics:', error);
    throw error;
  }
};
