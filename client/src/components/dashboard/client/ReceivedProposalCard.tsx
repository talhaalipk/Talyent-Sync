import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import type { Proposal } from "../../../store/useProposal";
import ProposalDetailModal from "./ProposalDetailModal";

export default function ReceivedProposalCard({ proposal }: { proposal: Proposal }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleChatClick = () => {
    if (proposal.senderId?._id) {
      navigate(`/chat/${proposal.senderId._id}`);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Header with Freelancer Info */}
        <div className="flex items-start gap-4 mb-4">
          <img
            src={proposal.senderId?.profilePic || "/default-avatar.png"}
            alt={proposal.senderId?.name || "Freelancer"}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-gray-900 truncate">
              {proposal.senderId?.name}
            </p>
            <p className="text-sm text-gray-500 truncate">@{proposal.senderId?.UserName}</p>
          </div>
        </div>

        {/* Job Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
          {proposal.jobId?.title}
        </h3>

        {/* Small Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{proposal.proposalDesc}</p>

        {/* Status + Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              proposal.status === "accepted"
                ? "bg-green-100 text-green-800"
                : proposal.status === "pending"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
          </span>

          <div className="flex items-center gap-2">
            {/* Chat Button */}
            <button
              onClick={handleChatClick}
              className="px-3 py-2 text-xs font-medium text-[#134848] bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors shadow-sm border border-gray-200 flex items-center gap-1.5"
            >
              <MessageCircle size={14} />
              Chat
            </button>

            {/* Existing Check Button */}
            <button
              onClick={() => setOpen(true)}
              className="px-4 py-2 text-xs font-medium text-white bg-[#134848] rounded-lg hover:bg-[#0f3737] transition-colors shadow-sm"
            >
              Check
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && <ProposalDetailModal proposal={proposal} onClose={() => setOpen(false)} />}
    </>
  );
}
