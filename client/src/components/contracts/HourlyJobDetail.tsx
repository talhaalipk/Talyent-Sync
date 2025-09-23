// src/components/contracts/HourlyJobDetail.tsx
import { useState } from "react";
import { useContractStore } from "../../store/contractStore";
import type { Contract } from "../../store/contractStore";

import Button from "../../ui/Button";
import Input from "../../ui/Input";
import TimesheetEntryCard from "./TimesheetEntryCard";
import { confirmToast } from "../../ui/toasterComfirm";
import CreateReviewModal from "../reviews/CreateReviewModal";

interface HourlyJobDetailProps {
  contract: Contract;
  userRole: string;
}

const HourlyJobDetail = ({ contract, userRole }: HourlyJobDetailProps) => {
  const { addTimesheet, requestCompletion, loading } = useContractStore();
  const [showAddTimesheet, setShowAddTimesheet] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [timesheetForm, setTimesheetForm] = useState({
    title: "",
    description: "",
    hoursWork: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalHours = contract.Hourtract?.reduce((total, entry) => total + entry.hoursWork, 0) || 0;
  const approvedHours =
    contract.Hourtract?.filter((entry) => entry.status === "approved").reduce(
      (total, entry) => total + entry.hoursWork,
      0
    ) || 0;
  const pendingHours =
    contract.Hourtract?.filter((entry) => entry.status === "awaiting_approval").reduce(
      (total, entry) => total + entry.hoursWork,
      0
    ) || 0;

  const totalEarnings = approvedHours * (contract.hourlyRate || 0);
  const pendingEarnings = pendingHours * (contract.hourlyRate || 0);

  const handleSubmitTimesheet = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !timesheetForm.title.trim() ||
      !timesheetForm.description.trim() ||
      !timesheetForm.hoursWork
    ) {
      return;
    }

    const hoursWork = parseFloat(timesheetForm.hoursWork);
    if (hoursWork <= 0 || hoursWork > 24) {
      alert("Please enter valid hours between 0.1 and 24");
      return;
    }

    setIsSubmitting(true);
    try {
      await addTimesheet(contract._id, {
        title: timesheetForm.title.trim(),
        description: timesheetForm.description.trim(),
        hoursWork,
      });

      // Reset form
      setTimesheetForm({ title: "", description: "", hoursWork: "" });
      setShowAddTimesheet(false);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  console.log("Contract in hourly detail :", contract);

  return (
    <div className="space-y-6">
      {/* Hourly Contract Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-[#134848] mb-4">Hourly Contract Overview</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#F9FAFB] p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Hourly Rate</h4>
            <p className="text-2xl font-bold text-[#134848]">
              ${(contract as any)?.proposalId?.bidAmount}/hr
            </p>
          </div>

          <div className="bg-[#F9FAFB] p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Total Hours</h4>
            <p className="text-2xl font-bold text-[#134848]">{totalHours}h</p>
          </div>

          <div className="bg-[#F9FAFB] p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Approved Earnings</h4>
            <p className="text-2xl font-bold text-[#10B981]">${totalEarnings.toLocaleString()}</p>
          </div>

          <div className="bg-[#F9FAFB] p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Pending Earnings</h4>
            <p className="text-2xl font-bold text-[#F59E0B]">${pendingEarnings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Add Timesheet Section - Freelancer Only */}
      {userRole === "freelancer" && contract.status === "active" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-[#134848]">Log Work Hours</h3>
            {!showAddTimesheet && (
              <button
                onClick={() => setShowAddTimesheet(true)}
                className="bg-[#2E90EB] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#134848] transition-colors"
              >
                + Add Hours
              </button>
            )}
          </div>

          {showAddTimesheet && (
            <form onSubmit={handleSubmitTimesheet} className="bg-[#F9FAFB] p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Task Title"
                  type="text"
                  value={timesheetForm.title}
                  onChange={(e) => setTimesheetForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Frontend development, Bug fixes"
                  required
                />
                <Input
                  label="Hours Worked"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="24"
                  value={timesheetForm.hoursWork}
                  onChange={(e) =>
                    setTimesheetForm((prev) => ({ ...prev, hoursWork: e.target.value }))
                  }
                  placeholder="e.g., 8.5"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Work Description
                </label>
                <textarea
                  value={timesheetForm.description}
                  onChange={(e) =>
                    setTimesheetForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe what work you completed..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E90EB]"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  text={isSubmitting ? "Submitting..." : "Submit Hours"}
                  type="submit"
                  disabled={isSubmitting || loading}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTimesheet(false);
                    setTimesheetForm({ title: "", description: "", hoursWork: "" });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Timesheet Entries */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-[#134848] mb-4">Work Log</h3>

        {!contract.Hourtract || contract.Hourtract.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-6 9l2 2 4-4"
              />
            </svg>
            <p className="text-gray-500">
              {userRole === "freelancer"
                ? "No work hours logged yet. Start by adding your first timesheet entry."
                : "The freelancer hasn't logged any work hours yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...contract.Hourtract].reverse().map((entry) => (
              <TimesheetEntryCard
                key={entry._id}
                entry={entry}
                contract={contract}
                userRole={userRole}
              />
            ))}
          </div>
        )}
      </div>

      {/* Submit for Completion - Freelancer Only */}
      {userRole === "freelancer" && contract.status === "active" && (
        <div className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#134848] mb-4">
            Submit Project for Completion
          </h3>
          <p className="text-[#1F2937] mb-4">
            When you've completed all the work for this project, submit it for client review. Make
            sure all your work hours are logged and approved before submitting.
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="font-medium text-[#F59E0B] text-sm">Before Submitting</h4>
                <p className="text-sm text-[#1F2937]">
                  Ensure all your work meets the project requirements and all hours are properly
                  logged. The client will review your submission and may request changes if needed.
                </p>
              </div>
            </div>
          </div>

          <Button
            text={isSubmitting ? "Submitting..." : "Submit for Completion"}
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
                  : "The freelancer has completed the work and submitted it for your review. Please review the work log and approve or request changes."}
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

export default HourlyJobDetail;
