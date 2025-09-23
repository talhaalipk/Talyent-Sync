import { useNavigate } from "react-router-dom";
import { Clock, DollarSign, MessageCircle } from "lucide-react";
import type { Proposal } from "../../../store/useProposal";

export default function ProposalCard({ proposal }: { proposal: Proposal }) {
  const navigate = useNavigate();

  const handleChatClick = () => {
    if (proposal.receiverId?._id) {
      navigate(`/chat/${proposal.receiverId._id}`);
    }
  };

  return (
    <div className="border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition bg-white">
      {/* 🔹 Client Info Section */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Client</h4>
        <div className="flex items-center gap-3">
          <img
            src={proposal.receiverId.profilePic}
            alt={proposal.receiverId.name}
            className="w-12 h-12 rounded-full object-cover border border-gray-200"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">{proposal.receiverId.name}</p>
            <p className="text-xs text-gray-600">
              {proposal.receiverId.clientProfile?.companyName || "No company"}
            </p>
            <p className="text-xs text-gray-400">@{proposal.receiverId.UserName}</p>
          </div>
        </div>
      </div>

      {/* 🔹 Job Info Section */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Job</h4>
        <h3 className="text-base font-semibold text-[#134848] mb-1">{proposal.jobId.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{proposal.proposalDesc}</p>
      </div>

      {/* 🔹 Bid & Date Section */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <span className="flex items-center gap-1">
          <DollarSign size={16} className="text-gray-400" />
          <span className="font-medium">Bid:</span> ${proposal.bidAmount}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={16} className="text-gray-400" />
          {new Date(proposal.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* 🔹 Status + Chat Button */}
      <div className="flex items-center justify-between">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
            ${
              proposal.status === "accepted"
                ? "bg-green-100 text-green-700"
                : proposal.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
            }`}
        >
          {proposal.status}
        </span>

        {/* Chat Button */}
        <button
          onClick={handleChatClick}
          className="px-3 py-2 text-xs font-medium text-[#134848] bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors shadow-sm border border-gray-200 flex items-center gap-1.5"
        >
          <MessageCircle size={14} />
          Chat
        </button>
      </div>
    </div>
  );
}
