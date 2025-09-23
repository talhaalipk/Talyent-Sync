// src/components/analytics/ClientDashboard.tsx
import type { ClientAnalytics } from "../../store/analyticsStore";
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
  LineChart,
  Line,
} from "recharts";

interface ClientDashboardProps {
  analytics: ClientAnalytics;
}

const ClientDashboard = ({ analytics }: ClientDashboardProps) => {
  const { contractStats, successRate, hourlyRates, fixedRates, monthlyTrends } = analytics;

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

  // Monthly trends data formatting
  const monthlyData = monthlyTrends.map((trend) => ({
    month: `${trend._id.year}-${String(trend._id.month).padStart(2, "0")}`,
    contracts: trend.contracts,
    spending: trend.spending,
  }));

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
          <p className="text-sm font-medium text-[#134848]">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.name.includes("spending") ||
              entry.name.includes("Rate") ||
              entry.name.includes("Amount")
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
              <p className="text-sm font-medium text-gray-500">Total Contracts</p>
              <p className="text-3xl font-bold text-[#134848]">{contractStats.total}</p>
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-3xl font-bold text-[#10B981]">{successRate}%</p>
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-3xl font-bold text-[#2E90EB]">
                ${contractStats.totalSpent.toLocaleString()}
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Hourly Rate</p>
              <p className="text-3xl font-bold text-[#F59E0B]">
                ${hourlyRates.averageHourlyRate.toFixed(0)}
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contract Status Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#134848] mb-4">
            Contract Status Distribution
          </h3>
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

        {/* Rate Comparison Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#134848] mb-4">Average Rates Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  type: "Hourly Rate",
                  average: hourlyRates.averageHourlyRate,
                  min: hourlyRates.minRate,
                  max: hourlyRates.maxRate,
                  contracts: hourlyRates.totalHourlyContracts,
                },
                {
                  type: "Fixed Rate",
                  average: fixedRates.averageFixedRate,
                  min: fixedRates.minAmount,
                  max: fixedRates.maxAmount,
                  contracts: fixedRates.totalFixedContracts,
                },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="type" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="average" fill={colors.secondary} name="Average Rate" />
              <Bar dataKey="min" fill={colors.success} name="Min Rate" />
              <Bar dataKey="max" fill={colors.warning} name="Max Rate" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trends Line Chart */}
      {monthlyData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#134848] mb-4">Monthly Contract Trends</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis yAxisId="left" stroke="#6B7280" />
              <YAxis yAxisId="right" orientation="right" stroke="#6B7280" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="contracts"
                stroke={colors.secondary}
                strokeWidth={3}
                dot={{ fill: colors.secondary, strokeWidth: 2, r: 6 }}
                name="Contracts"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="spending"
                stroke={colors.success}
                strokeWidth={3}
                dot={{ fill: colors.success, strokeWidth: 2, r: 6 }}
                name="Spending ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Hourly Contracts</h4>
          <p className="text-2xl font-bold text-[#134848]">{hourlyRates.totalHourlyContracts}</p>
          <p className="text-sm text-gray-600 mt-1">
            Range: ${hourlyRates.minRate} - ${hourlyRates.maxRate}/hr
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Fixed Contracts</h4>
          <p className="text-2xl font-bold text-[#134848]">{fixedRates.totalFixedContracts}</p>
          <p className="text-sm text-gray-600 mt-1">
            Avg: ${fixedRates.averageFixedRate.toLocaleString()}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Active Projects</h4>
          <p className="text-2xl font-bold text-[#2E90EB]">{contractStats.active}</p>
          <p className="text-sm text-gray-600 mt-1">Currently in progress</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Pending Approval</h4>
          <p className="text-2xl font-bold text-[#F59E0B]">{contractStats.awaiting_approval}</p>
          <p className="text-sm text-gray-600 mt-1">Awaiting your review</p>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
