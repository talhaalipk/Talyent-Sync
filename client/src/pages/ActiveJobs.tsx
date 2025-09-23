// src/pages/ActiveJobs.tsx
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useContractStore } from "../store/contractStore";
import PleaseLogin from "../components/PleaseLogin";
import Spinner from "../ui/Spinner";
import ActiveJobsList from "../components/contracts/ActiveJobsList";

const ActiveJobs = () => {
  const { isLoggedIn, user } = useAuthStore();
  const { contracts, loading, error, fetchActiveJobs } = useContractStore();

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchActiveJobs();
    }
  }, [isLoggedIn, user, fetchActiveJobs]);

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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#134848] mb-2">Active Jobs</h1>
          <p className="text-[#1F2937]">
            {user?.role === "freelancer"
              ? "Manage your ongoing projects and contracts"
              : "Track your hired freelancers and project progress"}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && contracts.length === 0 && (
          <div className="bg-[#F9FAFB] rounded-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-[#134848] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#134848]"
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
              <h3 className="text-xl font-semibold text-[#134848] mb-2">No Contracts Yet</h3>
              <p className="text-[#1F2937] mb-6">
                {user?.role === "freelancer"
                  ? "You don't have any active contracts yet. Start applying to jobs to begin your freelancing journey!"
                  : "You haven't hired any freelancers yet. Start by posting a job and reviewing proposals!"}
              </p>
              <button
                onClick={() => {
                  if (user?.role === "freelancer") {
                    window.location.href = "/find-jobs";
                  } else {
                    window.location.href = "/dashboard";
                  }
                }}
                className="bg-[#2E90EB] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#134848] transition-colors"
              >
                {user?.role === "freelancer" ? "Find Jobs" : "Post a Job"}
              </button>
            </div>
          </div>
        )}

        {/* Jobs List */}
        {contracts.length > 0 && (
          <ActiveJobsList contracts={contracts} userRole={user?.role || "freelancer"} />
        )}
      </div>
    </div>
  );
};

export default ActiveJobs;
