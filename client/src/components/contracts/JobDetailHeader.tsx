// src/components/contracts/JobDetailHeader.tsx
import type { Contract } from "../../store/contractStore";

interface JobDetailHeaderProps {
  contract: Contract;
  userRole: string;
}

const JobDetailHeader = ({ contract }: JobDetailHeaderProps) => {
  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";

    switch (status) {
      case "active":
        return `${baseClasses} bg-[#10B981] bg-opacity-10 text-white`;
      case "awaiting_approval":
        return `${baseClasses} bg-[#F59E0B] bg-opacity-10 text-white`;
      case "completed":
        return `${baseClasses} bg-[#10B981] bg-opacity-20 text-white`;
      case "disputed":
        return `${baseClasses} bg-[#EF4444] bg-opacity-10 text-white`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "awaiting_approval":
        return "Awaiting Approval";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-3xl font-bold text-[#134848] pr-4">{contract.jobId.title}</h1>
            <span className={getStatusBadge(contract.status)}>
              {getStatusText(contract.status)}
            </span>
          </div>

          <p className="text-[#1F2937] text-base mb-4 leading-relaxed">
            {contract.jobId.description}
          </p>

          {/* Job Details Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
              <p className="text-sm text-[#134848] font-medium">{contract.jobId.category}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Experience Level</h4>
              <p className="text-sm text-[#134848] font-medium capitalize">
                {contract.jobId.experienceLevel}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Duration</h4>
              <p className="text-sm text-[#134848] font-medium">
                {contract.jobId.duration.estimate}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Contract Value</h4>
              <p className="text-sm text-[#134848] font-medium">
                $
                {contract.type === "fixed"
                  ? contract.totalAmount?.toLocaleString()
                  : `${contract.hourlyRate}/hr`}
              </p>
            </div>
          </div>

          {/* Skills */}
          {contract.jobId.skillsRequired && contract.jobId.skillsRequired.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Skills Required</h4>
              <div className="flex flex-wrap gap-2">
                {contract.jobId.skillsRequired.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 bg-[#F9FAFB] text-[#1F2937] text-sm rounded-full border"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailHeader;
