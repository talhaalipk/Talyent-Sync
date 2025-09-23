// src/components/contracts/BriefJobDetails.tsx
import { Link } from "react-router-dom";
import type { Contract } from "../../store/contractStore";

interface BriefJobDetailsProps {
  contract: Contract;
  userRole: string;
}

const BriefJobDetails = ({ contract, userRole }: BriefJobDetailsProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  console.log("hours :", contract);

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case "active":
        return `${baseClasses} bg-[#10B981] bg-opacity-10 text-white`;
      case "awaiting_approval":
        return `${baseClasses} bg-[#F59E0B] bg-opacity-10 text-white`;
      case "completed":
        return `${baseClasses} bg-[#10B981] bg-opacity-20 text-white`;
      case "disputed":
        return `${baseClasses} bg-[#EF4444] bg-opacity-10 text-white`;
      case "admin_approved":
        return `${baseClasses} bg-[#1ADCF0] bg-opacity-10 text-white`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "awaiting_approval":
        return "Awaiting Approval";
      case "active":
        return "Active";
      case "completed":
        return "Completed";
      case "disputed":
        return "Disputed";
      default:
        return status;
    }
  };

  const otherUser = userRole === "freelancer" ? contract.client : contract.freelancer;
  const chatUserId = otherUser?._id;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Side - Job Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-semibold text-[#134848] mb-1">
                {contract?.jobId?.title}
              </h3>
              <span className={getStatusBadge(contract.status)}>
                {getStatusText(contract.status)}
              </span>
            </div>
          </div>

          {/* Job Description */}
          <p className="text-[#1F2937] text-sm mb-4 line-clamp-2">{contract?.jobId?.description}</p>

          {/* Contract Details */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <span className="text-xs text-gray-500 block mb-1">Type</span>
              <span className="text-sm font-medium text-[#134848] capitalize">{contract.type}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">
                {contract.type === "fixed" ? "Total Amount" : "Hourly Rate"}
              </span>
              <span className="text-sm font-medium text-[#134848]">
                $
                {contract.type === "fixed"
                  ? contract.totalAmount?.toLocaleString()
                  : `${contract?.proposal?.bidAmount}/hr`}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">Started</span>
              <span className="text-sm font-medium text-[#134848]">
                {formatDate(contract.createdAt)}
              </span>
            </div>
            {contract.type === "hourly" && contract.Hourtract && (
              <div>
                <span className="text-xs text-gray-500 block mb-1">Hours Logged</span>
                <span className="text-sm font-medium text-[#134848]">
                  {contract.Hourtract.reduce((total, entry) => total + entry.hoursWork, 0)}h
                </span>
              </div>
            )}
          </div>

          {/* Other User Info */}
          {otherUser && (
            <div className="flex items-center gap-3">
              <img
                src={otherUser.profilePic}
                alt={otherUser.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium text-[#134848]">
                  {otherUser.name || otherUser.UserName}
                </p>
                {userRole === "freelancer" && contract.client?.clientProfile?.companyName && (
                  <p className="text-xs text-gray-500">
                    {contract.client.clientProfile.companyName}
                  </p>
                )}
                {userRole === "client" && contract.freelancer?.freelancerProfile && (
                  <div className="flex items-center gap-2">
                    {contract.freelancer.freelancerProfile.ratingAvg && (
                      <span className="text-xs text-gray-500">
                        ⭐ {contract.freelancer.freelancerProfile.ratingAvg.toFixed(1)}
                      </span>
                    )}
                    {/* {contract.freelancer.freelancerProfile.successRate && (
                      <span className="text-xs text-gray-500">
                        {contract.freelancer.freelancerProfile.successRate}% Success
                      </span>
                    )} */}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[200px]">
          <Link
            to={`/active-job/${contract._id}`}
            className="bg-[#2E90EB] text-white px-4 py-2 rounded-lg font-medium text-center hover:bg-[#134848] transition-colors text-sm"
          >
            View Details
          </Link>

          {chatUserId && (
            <Link
              to={`/chat/${chatUserId}`}
              className="bg-white text-[#2E90EB] border border-[#2E90EB] px-4 py-2 rounded-lg font-medium text-center hover:bg-[#2E90EB] hover:text-white transition-colors text-sm"
            >
              💬 Chat
            </Link>
          )}
        </div>
      </div>

      {/* Skills Tags */}
      {contract?.jobId?.skillsRequired && contract?.jobId?.skillsRequired?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {contract.jobId.skillsRequired.slice(0, 6).map((skill, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-[#F9FAFB] text-[#1F2937] text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
            {contract.jobId.skillsRequired.length > 6 && (
              <span className="inline-block px-2 py-1 bg-[#F9FAFB] text-[#1F2937] text-xs rounded-full">
                +{contract.jobId.skillsRequired.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BriefJobDetails;
