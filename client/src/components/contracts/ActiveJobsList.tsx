// src/components/contracts/ActiveJobsList.tsx
import type { Contract } from "../../store/contractStore";
import BriefJobDetails from "./BriefJobDetails";

interface ActiveJobsListProps {
  contracts: Contract[];
  userRole: string;
}

const ActiveJobsList = ({ contracts, userRole }: ActiveJobsListProps) => {
  // Sort contracts by most recent first
  const sortedContracts = [...contracts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#F9FAFB] p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-[#1F2937] mb-1">Active</h3>
          <p className="text-2xl font-bold text-[#134848]">
            {contracts.filter((c) => c.status === "active").length}
          </p>
        </div>
        <div className="bg-[#F9FAFB] p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-[#1F2937] mb-1">Awaiting Approval</h3>
          <p className="text-2xl font-bold text-[#F59E0B]">
            {contracts.filter((c) => c.status === "awaiting_approval").length}
          </p>
        </div>
        <div className="bg-[#F9FAFB] p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-[#1F2937] mb-1">Completed</h3>
          <p className="text-2xl font-bold text-[#10B981]">
            {contracts.filter((c) => c.status === "completed").length}
          </p>
        </div>
        <div className="bg-[#F9FAFB] p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-[#1F2937] mb-1">Disputed</h3>
          <p className="text-2xl font-bold text-[#EF4444]">
            {contracts.filter((c) => c.status === "disputed").length}
          </p>
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {sortedContracts.map((contract) => (
          <BriefJobDetails key={contract._id} contract={contract} userRole={userRole} />
        ))}
      </div>
    </div>
  );
};

export default ActiveJobsList;
