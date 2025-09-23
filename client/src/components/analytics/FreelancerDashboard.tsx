// src/components/analytics/FreelancerDashboard.tsx
import type { FreelancerAnalytics } from "../../store/analyticsStore";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface FreelancerDashboardProps {
  analytics: FreelancerAnalytics;
}

const FreelancerDashboard = ({ analytics }: FreelancerDashboardProps) => {
  const {
    walletStats,
    contractStats,
    successRate,
    proposalStats,
    monthlyEarnings,
    contractTypeStats,
  } = analytics;

  // Color scheme
  const colors = {
    primary: "#134848",
    secondary: "#2E90EB",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    gray: "#6B7280",
  };

  // Pie chart data for contract status
  const contractStatusData = [
    { name: "Completed", value: contractStats.completed, color: colors.success },
    { name: "Active", value: contractStats.active, color: colors.secondary },
    { name: "Awaiting Approval", value: contractStats.awaiting_approval, color: colors.warning },
    { name: "Disputed", value: contractStats.disputed, color: colors.error },
  ].filter((item) => item.value > 0);

  // Contract type distribution data
  const contractTypeData = contractTypeStats.map((stat) => ({
    type: stat._id === "hourly" ? "Hourly" : "Fixed",
    contracts: stat.count,
    earnings: stat.earnings,
  }));

  // Monthly earnings data formatting
  const monthlyData = monthlyEarnings.map((earning) => ({
    month: `${earning._id.year}-${String(earning._id.month).padStart(2, "0")}`,
    earnings: earning.earnings,
    contracts: earning.contracts,
  }));

  // Wallet breakdown for pie chart
  const walletData = [
    { name: "Available", value: walletStats.availableBalance, color: colors.success },
    { name: "Pending", value: walletStats.pendingBalance, color: colors.warning },
    { name: "Withdrawn", value: walletStats.totalWithdrawn, color: colors.gray },
  ].filter((item) => item.value > 0);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
          <p className="text-sm font-medium text-[#134848]">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.name.includes("earnings") ||
              entry.name.includes("Balance") ||
              entry.name.includes("value")
                ? `$${entry.value.toLocaleString()}`
                : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <p className="text-3xl font-bold text-[#10B981]">
                ${walletStats.totalEarnings.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#10B981] bg-opacity-10 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#10B981]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Available Balance</p>
              <p className="text-3xl font-bold text-[#2E90EB]">
                ${walletStats.availableBalance.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#2E90EB] bg-opacity-10 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#2E90EB]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-3xl font-bold text-[#134848]">{successRate}%</p>
            </div>
            <div className="w-12 h-12 bg-[#134848] bg-opacity-10 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#134848]"
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
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Hire Rate</p>
              <p className="text-3xl font-bold text-[#F59E0B]">
                {proposalStats.proposalToHireRatio}%
              </p>
            </div>
            <div className="w-12 h-12 bg-[#F59E0B] bg-opacity-10 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#F59E0B]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wallet Balance Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#134848] mb-4">Wallet Breakdown</h3>
          {walletData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={walletData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) =>
                    `${name} ${typeof percent === "number" ? (percent * 100).toFixed(0) : "0"}%`
                  }
                >
                  {walletData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No wallet data available
            </div>
          )}
        </div>

        {/* Contract Status Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#134848] mb-4">Contract Status</h3>
          {contractStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contractStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) =>
                    `${name} ${typeof percent === "number" ? (percent * 100).toFixed(0) : "0"}%`
                  }
                >
                  {contractStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No contract data available
            </div>
          )}
        </div>
      </div>

      {/* Monthly Earnings Trend */}
      {monthlyData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#134848] mb-4">Monthly Earnings Trend</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.success} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.success} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke={colors.success}
                strokeWidth={3}
                fill="url(#earningsGradient)"
                name="Earnings ($)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Contract Type Performance */}
      {contractTypeData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#134848] mb-4">Contract Type Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contractTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="type" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="contracts" fill={colors.secondary} name="Contracts" />
              <Bar dataKey="earnings" fill={colors.success} name="Earnings ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Pending Balance</h4>
          <p className="text-2xl font-bold text-[#F59E0B]">
            ${walletStats.pendingBalance.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">Awaiting release</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Total Proposals</h4>
          <p className="text-2xl font-bold text-[#134848]">{proposalStats.total}</p>
          <p className="text-sm text-gray-600 mt-1">{proposalStats.accepted} accepted</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Active Projects</h4>
          <p className="text-2xl font-bold text-[#2E90EB]">{contractStats.active}</p>
          <p className="text-sm text-gray-600 mt-1">Currently working</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Total Withdrawn</h4>
          <p className="text-2xl font-bold text-[#6B7280]">
            ${walletStats.totalWithdrawn.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">Lifetime withdrawals</p>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
