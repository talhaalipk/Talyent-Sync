// src/pages/MyAnalytics.tsx
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useAnalyticsStore } from "../store/analyticsStore";
import PleaseLogin from "../components/PleaseLogin";
import Spinner from "../ui/Spinner";
import ClientDashboard from "../components/analytics/ClientDashboard";
import FreelancerDashboard from "../components/analytics/FreelancerDashboard";

const MyAnalytics = () => {
  const { isLoggedIn, user } = useAuthStore();
  const { clientAnalytics, freelancerAnalytics, userRole, loading, error, fetchAnalytics } =
    useAnalyticsStore();

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchAnalytics();
    }
  }, [isLoggedIn, user, fetchAnalytics]);

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
          <h1 className="text-3xl font-bold text-[#134848] mb-2">My Analytics</h1>
          <p className="text-[#1F2937]">
            {userRole === "freelancer"
              ? "Track your freelance performance, earnings, and project success metrics"
              : "Monitor your project spending, success rates, and hiring patterns"}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Dashboard Content */}
        {userRole === "freelancer" && freelancerAnalytics && (
          <FreelancerDashboard analytics={freelancerAnalytics} />
        )}

        {userRole === "client" && clientAnalytics && (
          <ClientDashboard analytics={clientAnalytics} />
        )}

        {!userRole && !loading && (
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#134848] mb-2">No Analytics Available</h3>
              <p className="text-[#1F2937]">
                Start using the platform to generate analytics data. Complete some projects to see
                your performance metrics.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAnalytics;
