import React from "react";
import type { RecentContract } from "../../store/usePublicFreelancerStore";

interface RecentWorkProps {
  recentContracts: RecentContract[];
}

const RecentWork: React.FC<RecentWorkProps> = ({ recentContracts }) => {
  if (recentContracts.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-4">Recent Work</h3>
      <div className="space-y-4">
        {recentContracts.slice(0, 5).map((contract, index) => (
          <div key={index} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
            <h4 className="font-medium text-sm text-gray-900 mb-1">{contract.jobTitle}</h4>
            <p className="text-xs text-gray-600 mb-1">Client: {contract.clientName}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {new Date(contract.completedAt).toLocaleDateString()}
              </span>
              <span className="text-xs font-medium text-[#134848]">
                {contract.type === "fixed" ? "Fixed Price" : "Hourly"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentWork;
