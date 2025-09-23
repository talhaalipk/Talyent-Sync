// src/components/Admin/SystemAnalysis.tsx
import { useEffect } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { useSystemAnalysisStore } from "../../store/Admin/systemAnalysisStore";
import StatsOverview from "./Analytics/StatsOverview";
import UsersAnalytics from "./Analytics/UsersAnalytics";
import JobsAnalytics from "./Analytics/JobsAnalytics";
import ProposalsAnalytics from "./Analytics/ProposalsAnalytics";
import ContractsAnalytics from "./Analytics/ContractsAnalytics";
import PaymentsAnalytics from "./Analytics/PaymentsAnalytics";

const SystemAnalysis = () => {
  const { data, loading, error, lastUpdated, fetchSystemAnalysis, refreshData, clearError } =
    useSystemAnalysisStore();

  useEffect(() => {
    fetchSystemAnalysis();
  }, [fetchSystemAnalysis]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleRefresh = async () => {
    await refreshData();
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#134848] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#2E90EB] bg-opacity-10 rounded-lg flex items-center justify-center">
            <BarChart3 className="text-[#2E90EB]" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#134848]">System Analysis</h1>
            <p className="text-gray-600">Comprehensive platform analytics and insights</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium text-[#134848]">{formatLastUpdated(lastUpdated)}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 bg-[#134848] text-white rounded-lg hover:bg-[#134848]/90 transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <p className="text-red-800 font-medium">Error loading analytics</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Analytics Content */}
      {data && (
        <>
          {/* Stats Overview */}
          <StatsOverview data={data} />

          {/* Analytics Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UsersAnalytics data={data.users} />
            <JobsAnalytics data={data.jobs} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProposalsAnalytics data={data.proposals} />
            <ContractsAnalytics data={data.contracts} />
          </div>

          {/* Full width sections */}
          <PaymentsAnalytics data={data.payments} />
        </>
      )}
    </div>
  );
};

export default SystemAnalysis;
