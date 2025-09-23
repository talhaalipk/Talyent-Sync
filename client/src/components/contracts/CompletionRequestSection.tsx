// src/components/contracts/CompletionRequestSection.tsx
import { useState } from "react";
import { useContractStore } from "../../store/contractStore";
import type { Contract } from "../../store/contractStore";
import { confirmToast } from "../../ui/toasterComfirm";
import CreateReviewModal from "../reviews/CreateReviewModal";

interface CompletionRequestSectionProps {
  contract: Contract;
  userRole: string;
}

const CompletionRequestSection = ({ contract, userRole }: CompletionRequestSectionProps) => {
  const { handleCompletionResponse, loading } = useContractStore();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleAccept = async () => {
    const confirmed = await confirmToast(
      "Are you sure you want to approve this project completion? This will release payment to the freelancer."
    );

    if (confirmed) {
      setIsProcessing(true);
      try {
        await handleCompletionResponse(contract._id, {
          action: "accept",
          feedback: feedback.trim() || undefined,
        });

        // NEW: Show review modal after successful acceptance
        setTimeout(() => {
          setShowReviewModal(true);
        }, 1000); // Small delay to let the user see the success message
      } finally {
        setIsProcessing(false);
        setShowFeedbackForm(false);
        setFeedback("");
      }
    }
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      alert("Please provide feedback explaining why you are rejecting the completion request.");
      return;
    }

    const confirmed = await confirmToast(
      "Are you sure you want to reject this completion request? This will create a dispute that may need resolution."
    );

    if (confirmed) {
      setIsProcessing(true);
      try {
        await handleCompletionResponse(contract._id, {
          action: "reject",
          feedback: feedback.trim(),
        });
      } finally {
        setIsProcessing(false);
        setShowFeedbackForm(false);
        setFeedback("");
      }
    }
  };

  // Don't render anything if contract is not awaiting approval or if it's not a client
  if (contract.status !== "awaiting_approval" || userRole !== "client") {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-[#F59E0B] bg-opacity-10 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[#F59E0B]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#134848] mb-2">Completion Review Required</h3>
          <p className="text-[#1F2937] mb-4">
            The freelancer has completed the work and submitted it for your review. Please review
            all deliverables and either approve the work to release payment, or provide feedback if
            changes are needed.
          </p>

          {!showFeedbackForm ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="bg-[#10B981] text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Review & Approve
              </button>
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="bg-[#EF4444] text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Request Changes
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-[#134848] mb-3">Review Completion Request</h4>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Feedback (Optional for approval, required for rejection)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback about the completed work, areas for improvement, or explain why changes are needed..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E90EB]"
                />
              </div>

              <div className="bg-[#F9FAFB] p-4 rounded-lg mb-4">
                <h5 className="font-medium text-[#134848] mb-2">Before You Decide:</h5>
                <ul className="text-sm text-[#1F2937] space-y-1">
                  <li>• Review all deliverables against the original requirements</li>
                  <li>• Check that all agreed-upon features/tasks are completed</li>
                  <li>• Test functionality (if applicable) before approval</li>
                  <li>• Approving will release payment immediately</li>
                  <li>• Requesting changes will create a dispute for resolution</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAccept}
                  disabled={isProcessing || loading}
                  className="bg-[#10B981] text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Approve & Release Payment"}
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing || loading || !feedback.trim()}
                  className="bg-[#EF4444] text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Request Changes"}
                </button>
                <button
                  onClick={() => {
                    setShowFeedbackForm(false);
                    setFeedback("");
                  }}
                  className="text-gray-600 hover:text-gray-800 px-6 py-3 border border-gray-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <CreateReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        contractId={contract._id}
        otherUserName={contract.freelancer?.name || contract.freelancer?.UserName || "Freelancer"}
        jobTitle={contract.jobId.title}
        userRole="client"
      />
    </div>
  );
};

export default CompletionRequestSection;
