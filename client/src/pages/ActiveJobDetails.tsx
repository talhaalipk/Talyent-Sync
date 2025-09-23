// src/pages/ActiveJobDetails.tsx
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useContractStore } from "../store/contractStore";
import PleaseLogin from "../components/PleaseLogin";
import Spinner from "../ui/Spinner";
import JobDetailHeader from "../components/contracts/JobDetailHeader";
import FixedJobDetail from "../components/contracts/FixedJobDetail";
import HourlyJobDetail from "../components/contracts/HourlyJobDetail";
import CompletionRequestSection from "../components/contracts/CompletionRequestSection";

const ActiveJobDetails = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const { isLoggedIn, user } = useAuthStore();
  const { currentContract, loading, error, fetchContractDetails, clearCurrentContract } =
    useContractStore();

  useEffect(() => {
    if (isLoggedIn && user && contractId) {
      fetchContractDetails(contractId);
    }

    return () => {
      clearCurrentContract();
    };
  }, [isLoggedIn, user, contractId, fetchContractDetails, clearCurrentContract]);

  if (!isLoggedIn) {
    return <PleaseLogin />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
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
          </div>
          <h3 className="text-xl font-semibold text-[#134848] mb-2">Error Loading Contract</h3>
          <p className="text-[#1F2937] mb-6">{error}</p>
          <Link
            to="/active-jobs"
            className="bg-[#2E90EB] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#134848] transition-colors"
          >
            Back to Active Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (!currentContract) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#134848] mb-2">Contract Not Found</h3>
          <p className="text-[#1F2937] mb-6">
            The contract you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link
            to="/active-jobs"
            className="bg-[#2E90EB] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#134848] transition-colors"
          >
            Back to Active Jobs
          </Link>
        </div>
      </div>
    );
  }

  const otherUser =
    user?.role === "freelancer" ? currentContract.client : currentContract.freelancer;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            to="/active-jobs"
            className="text-[#2E90EB] hover:text-[#134848] transition-colors text-sm"
          >
            ← Back to Active Jobs
          </Link>
        </nav>

        {/* Job Header with details and action buttons */}
        <JobDetailHeader contract={currentContract} userRole={user?.role || "freelancer"} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Type Specific Content */}
            {currentContract.type === "fixed" ? (
              <FixedJobDetail contract={currentContract} userRole={user?.role || "freelancer"} />
            ) : (
              <HourlyJobDetail contract={currentContract} userRole={user?.role || "freelancer"} />
            )}

            {/* Completion Request Section */}
            <CompletionRequestSection
              contract={currentContract}
              userRole={user?.role || "freelancer"}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Other User Info Card */}
            {otherUser && (
              <div className="bg-[#F9FAFB] rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-[#134848] mb-4">
                  {user?.role === "freelancer" ? "Client Information" : "Freelancer Information"}
                </h3>

                <div className="flex items-start gap-4">
                  <img
                    src={otherUser.profilePic}
                    alt={otherUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#134848]">
                      {otherUser.name || otherUser.UserName}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{otherUser.email}</p>

                    {user?.role === "freelancer" && currentContract.client?.clientProfile && (
                      <div className="space-y-2">
                        {currentContract.client.clientProfile.companyName && (
                          <p className="text-sm text-[#1F2937]">
                            <span className="font-medium">Company:</span>{" "}
                            {currentContract.client.clientProfile.companyName}
                          </p>
                        )}
                        {currentContract.client.clientProfile.location && (
                          <p className="text-sm text-[#1F2937]">
                            <span className="font-medium">Location:</span>{" "}
                            {currentContract.client.clientProfile.location}
                          </p>
                        )}
                        {currentContract.client.clientProfile.clientRating && (
                          <p className="text-sm text-[#1F2937]">
                            <span className="font-medium">Rating:</span>{" "}
                            {currentContract.client.clientProfile.clientRating}/5
                          </p>
                        )}
                      </div>
                    )}

                    {user?.role === "client" && currentContract.freelancer?.freelancerProfile && (
                      <div className="space-y-2">
                        {currentContract.freelancer.freelancerProfile.location && (
                          <p className="text-sm text-[#1F2937]">
                            <span className="font-medium">Location:</span>{" "}
                            {currentContract.freelancer.freelancerProfile.location}
                          </p>
                        )}
                        {currentContract.freelancer.freelancerProfile.ratingAvg && (
                          <p className="text-sm text-[#1F2937]">
                            <span className="font-medium">Rating:</span>{" "}
                            {currentContract.freelancer.freelancerProfile.ratingAvg.toFixed(1)}/5
                          </p>
                        )}
                        {currentContract.freelancer.freelancerProfile.successRate && (
                          <p className="text-sm text-[#1F2937]">
                            <span className="font-medium">Success Rate:</span>{" "}
                            {currentContract.freelancer.freelancerProfile.successRate}%
                          </p>
                        )}
                        {currentContract.freelancer.freelancerProfile.skills &&
                          currentContract.freelancer.freelancerProfile.skills.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-[#1F2937] mb-2">Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {currentContract.freelancer.freelancerProfile.skills
                                  .slice(0, 5)
                                  .map((skill, index) => (
                                    <span
                                      key={index}
                                      className="inline-block px-2 py-1 bg-white text-[#1F2937] text-xs rounded border"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  <Link
                    to={`/chat?userId=${otherUser._id}`}
                    className="w-full bg-[#2E90EB] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#134848] transition-colors text-center block"
                  >
                    Chat
                  </Link>
                  <button
                    className="w-full bg-white text-[#2E90EB] border border-[#2E90EB] py-2 px-4 rounded-lg font-medium hover:bg-[#2E90EB] hover:text-white transition-colors"
                    onClick={() => {
                      // TODO: Implement video call functionality
                      alert("Video call feature coming soon!");
                    }}
                  >
                    Video Call
                  </button>
                </div>
              </div>
            )}

            {/* Contract Summary Card */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-[#134848] mb-4">Contract Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Contract Type:</span>
                  <span className="text-sm font-medium text-[#134848] capitalize">
                    {currentContract.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    {currentContract.type === "fixed" ? "Total Amount:" : "Hourly Rate:"}
                  </span>
                  <span className="text-sm font-medium text-[#134848]">
                    $
                    {currentContract.type === "fixed"
                      ? currentContract.totalAmount?.toLocaleString()
                      : `${currentContract.hourlyRate}/hr`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span
                    className={`text-sm font-medium capitalize ${
                      currentContract.status === "active"
                        ? "text-[#10B981]"
                        : currentContract.status === "awaiting_approval"
                          ? "text-[#F59E0B]"
                          : currentContract.status === "completed"
                            ? "text-[#10B981]"
                            : "text-[#EF4444]"
                    }`}
                  >
                    {currentContract.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Started:</span>
                  <span className="text-sm font-medium text-[#134848]">
                    {new Date(currentContract.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {currentContract.escrowBalance > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Escrow Balance:</span>
                    <span className="text-sm font-medium text-[#134848]">
                      ${currentContract.escrowBalance.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveJobDetails;
