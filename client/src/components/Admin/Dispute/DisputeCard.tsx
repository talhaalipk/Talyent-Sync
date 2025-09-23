// src/components/Admin/Dispute/DisputeCard.tsx
import { Eye, Clock, DollarSign, Briefcase } from "lucide-react";
import type { DisputedContract } from "../../../store/Admin/disputeStore";

interface DisputeCardProps {
  dispute: DisputedContract;
  onViewDetails: () => void;
}

const DisputeCard = ({ dispute, onViewDetails }: DisputeCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 min-w-0">
          <Briefcase size={16} className="text-gray-500" />
          <h4 className="font-medium text-[#134848] truncate">{dispute.jobId.title}</h4>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            dispute.type === "fixed" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
          }`}
        >
          {dispute.type}
        </span>
      </div>

      {/* Parties */}
      <div className="space-y-3 mb-4">
        {/* Client */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={dispute.clientId.profilePic}
              alt={dispute.clientId.UserName}
              className="w-8 h-8 rounded-full border border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dispute.clientId.UserName)}&background=134848&color=fff`;
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{dispute.clientId.UserName}</p>
            <p className="text-xs text-gray-500">Client</p>
          </div>
        </div>

        {/* VS Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-xs font-medium text-gray-500 bg-white px-2">VS</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Freelancer */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={dispute.freelancerId.profilePic}
              alt={dispute.freelancerId.UserName}
              className="w-8 h-8 rounded-full border border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dispute.freelancerId.UserName)}&background=134848&color=fff`;
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">F</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{dispute.freelancerId.UserName}</p>
            <p className="text-xs text-gray-500">Freelancer</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-green-600" />
          <div>
            <p className="text-xs text-gray-500">Amount</p>
            <p className="text-sm font-semibold text-green-600">
              {formatCurrency(dispute.totalAmount)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Disputed On</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(dispute.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onViewDetails}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#134848] text-white rounded-lg hover:bg-[#134848]/90 transition-colors"
      >
        <Eye size={16} />
        View Details & Resolve
      </button>
    </div>
  );
};

export default DisputeCard;
