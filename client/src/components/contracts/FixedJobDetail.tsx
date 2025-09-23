// src/components/contracts/FixedJobDetail.tsx
import { useState } from "react";
import { useContractStore } from "../../store/contractStore";
import type { Contract } from "../../store/contractStore";
import Button from "../../ui/Button";
import { confirmToast } from "../../ui/toasterComfirm";
import CreateReviewModal from "../reviews/CreateReviewModal";

interface FixedJobDetailProps {
  contract: Contract;
  userRole: string;
}

const FixedJobDetail = ({ contract, userRole }: FixedJobDetailProps) => {
  const { requestCompletion, loading } = useContractStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleSubmitCompletion = async () => {
    const confirmed = await confirmToast(
      "Are you sure you want to submit this project for completion? This will notify the client for review."
    );

    if (confirmed) {
      setIsSubmitting(true);
      try {
        await requestCompletion(contract._id);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Fixed Budget Contract Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-[#134848] mb-4">Fixed Price Contract</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#F9FAFB] p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Total Amount</h4>
            <p className="text-2xl font-bold text-[#134848]">
              ${contract.totalAmount?.toLocaleString()}
            </p>
          </div>

          <div className="bg-[#F9FAFB] p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Escrow Balance</h4>
            <p className="text-2xl font-bold text-[#134848]">
              ${contract.escrowBalance?.toLocaleString()}
            </p>
          </div>

          <div className="bg-[#F9FAFB] p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Payment Status</h4>
            <p
              className={`text-lg font-semibold ${
                contract.status === "completed"
                  ? "text-[#10B981]"
                  : contract.status === "awaiting_approval"
                    ? "text-[#F59E0B]"
                    : "text-[#2E90EB]"
              }`}
            >
              {contract.status === "completed"
                ? "Paid"
                : contract.status === "awaiting_approval"
                  ? "Pending"
                  : "In Escrow"}
            </p>
          </div>
        </div>
      </div>

      {/* Project Description from Proposal */}
      {contract.proposal && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-[#134848] mb-4">Project Proposal</h3>
          <div className="prose max-w-none">
            <p className="text-[#1F2937] leading-relaxed whitespace-pre-wrap">
              {contract.proposal.proposalDesc}
            </p>
          </div>

          {contract.proposal.estimatedDelivery && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Estimated Delivery:</span>
                  <span className="ml-2 text-sm text-[#134848] font-medium">
                    {contract.proposal.estimatedDelivery}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Freelancer Actions */}
      {userRole === "freelancer" && contract.status === "active" && (
        <div className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#134848] mb-4">Submit Work for Review</h3>
          <p className="text-[#1F2937] mb-4">
            Once you've completed the work according to the project requirements, submit it for
            client review. The client will then approve the work and release payment.
          </p>

          <div className="bg-white border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-[#F59E0B] mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <h4 className="font-medium text-[#F59E0B] text-sm">Important</h4>
                <p className="text-sm text-[#1F2937]">
                  Make sure your work meets all the project requirements before submitting. Once
                  submitted, the client will review and either approve or request changes.
                </p>
              </div>
            </div>
          </div>

          <Button
            text={isSubmitting ? "Submitting..." : "Submit Work for Completion"}
            onClick={handleSubmitCompletion}
            disabled={isSubmitting || loading}
          />
        </div>
      )}

      {/* Status Messages */}
      {contract.status === "awaiting_approval" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-[#F59E0B] mt-0.5 flex-shrink-0"
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
            <div>
              <h4 className="font-semibold text-[#F59E0B] text-lg">
                {userRole === "freelancer" ? "Awaiting Client Review" : "Review Required"}
              </h4>
              <p className="text-[#1F2937]">
                {userRole === "freelancer"
                  ? "Your work has been submitted and is awaiting client approval. You will be notified once the client reviews your submission."
                  : "The freelancer has completed the work and submitted it for your review. Please review the deliverables and approve or request changes."}
              </p>
            </div>
          </div>
        </div>
      )}

      {contract.status === "completed" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-[#10B981] mt-0.5 flex-shrink-0"
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
            <div className="flex-1">
              <h4 className="font-semibold text-[#10B981] text-lg">Project Completed</h4>
              <p className="text-[#1F2937] mb-4">
                Congratulations! The client has approved your work and payment has been released to
                your account.
              </p>
              <button
                onClick={() => setShowReviewModal(true)}
                className="bg-[#2E90EB] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#134848] transition-colors"
              >
                Leave a Review for Client
              </button>
            </div>
          </div>

          {/* Review Modal */}
          <CreateReviewModal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            contractId={contract._id}
            otherUserName={contract.client?.name || contract.client?.UserName || "Client"}
            jobTitle={contract.jobId.title}
            userRole="freelancer"
          />
        </div>
      )}

      {contract.status === "disputed" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-[#EF4444] mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="font-semibold text-[#EF4444] text-lg">Contract Disputed</h4>
              <p className="text-[#1F2937]">
                There is a dispute with this contract that requires resolution. Please contact
                support for assistance in resolving this matter.
              </p>
              <button className="mt-3 bg-[#EF4444] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedJobDetail;
