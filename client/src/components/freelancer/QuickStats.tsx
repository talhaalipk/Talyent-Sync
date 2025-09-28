import React from "react";
import { DollarSign, CheckCircle, Clock, Award } from "lucide-react";
import type { ContractStats } from "../../store/usePublicFreelancerStore";

interface QuickStatsProps {
  totalEarnings: number;
  contractStats: ContractStats;
  successRate: number;
}

const QuickStats: React.FC<QuickStatsProps> = ({ totalEarnings, contractStats, successRate }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-6">Quick Stats</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-gray-700 font-medium">Total Earned</span>
          </div>
          <span className="font-bold text-green-700">${totalEarnings.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-gray-700 font-medium">Jobs Completed</span>
          </div>
          <span className="font-bold text-blue-700">{contractStats.completedContracts}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-gray-700 font-medium">Active Projects</span>
          </div>
          <span className="font-bold text-purple-700">{contractStats.activeContracts}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Award className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-gray-700 font-medium">Success Rate</span>
          </div>
          <span className="font-bold text-orange-700">{successRate}%</span>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
