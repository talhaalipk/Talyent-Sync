// src/components/contracts/TimesheetEntryCard.tsx
import { useState } from "react";
import type { Contract, TimesheetEntry } from "../../store/contractStore";
import { useContractStore } from "../../store/contractStore";

interface TimesheetEntryCardProps {
  entry: TimesheetEntry;
  contract: Contract;
  userRole: string;
}

const TimesheetEntryCard = ({ entry, contract, userRole }: TimesheetEntryCardProps) => {
  const { updateTimesheetStatus, loading } = useContractStore();
  const [showActions, setShowActions] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case "approved":
        return `${baseClasses} bg-[#10B981] bg-opacity-10 text-white`;
      case "awaiting_approval":
        return `${baseClasses} bg-[#F59E0B] bg-opacity-10 text-white`;
      case "reject":
        return `${baseClasses} bg-[#EF4444] bg-opacity-10 text-white`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "awaiting_approval":
        return "Pending Review";
      case "approved":
        return "Approved";
      case "reject":
        return "Rejected";
      default:
        return status;
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await updateTimesheetStatus(contract._id, {
        timesheetId: entry._id,
        status: "approved",
      });
    } finally {
      setIsProcessing(false);
      setShowActions(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setIsProcessing(true);
    try {
      await updateTimesheetStatus(contract._id, {
        timesheetId: entry._id,
        status: "reject",
        rejectionReason: rejectionReason.trim(),
      });
    } finally {
      setIsProcessing(false);
      setShowActions(false);
      setRejectionReason("");
    }
  };

  const earnings = entry.hoursWork * (contract.hourlyRate || 0);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-lg font-semibold text-[#134848]">{entry.title}</h4>
            <span className={getStatusBadge(entry.status)}>{getStatusText(entry.status)}</span>
          </div>

          <p className="text-[#1F2937] mb-3 leading-relaxed">{entry.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block mb-1">Hours Worked</span>
              <span className="font-medium text-[#134848]">{entry.hoursWork}h</span>
            </div>
            {/* <div>
              <span className="text-gray-500 block mb-1">Earnings</span>
              <span className="font-medium text-[#134848]">${earnings.toFixed(2)}</span>
            </div> */}
            <div>
              <span className="text-gray-500 block mb-1">Submitted</span>
              <span className="font-medium text-[#134848]">{formatDate(entry.completedAt)}</span>
            </div>
            {entry.approvedAt && (
              <div>
                <span className="text-gray-500 block mb-1">
                  {entry.status === "approved" ? "Approved" : "Processed"}
                </span>
                <span className="font-medium text-[#134848]">{formatDate(entry.approvedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions for Client */}
        {userRole === "client" && entry.status === "awaiting_approval" && (
          <div className="flex-shrink-0">
            {!showActions ? (
              <button
                onClick={() => setShowActions(true)}
                className="bg-[#2E90EB] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#134848] transition-colors text-sm"
              >
                Review
              </button>
            ) : (
              <div className="bg-[#F9FAFB] p-4 rounded-lg min-w-[300px]">
                <h5 className="font-medium text-[#134848] mb-3">Review Timesheet</h5>

                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Optional: Add feedback or reason for rejection..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E90EB] mb-3"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing || loading}
                    className="flex-1 bg-[#10B981] text-white px-3 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors text-sm disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isProcessing || loading}
                    className="flex-1 bg-[#EF4444] text-white px-3 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : "Reject"}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowActions(false);
                    setRejectionReason("");
                  }}
                  className="w-full mt-2 text-gray-600 hover:text-gray-800 text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status-specific Messages */}
      {entry.status === "approved" && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-[#10B981]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-[#10B981] font-medium">
              Approved - Payment of ${earnings.toFixed(2)} processed
            </span>
          </div>
        </div>
      )}

      {entry.status === "reject" && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-[#EF4444] mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <div>
              <span className="text-sm text-[#EF4444] font-medium block mb-1">
                Rejected by client
              </span>
              {rejectionReason && <span className="text-sm text-[#1F2937]">{rejectionReason}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimesheetEntryCard;
