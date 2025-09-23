// src/components/Admin/Analytics/ProposalsAnalytics.tsx
import { FileText, DollarSign, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";
import type { SystemAnalysisData } from "../../../store/Admin/systemAnalysisStore";

interface ProposalsAnalyticsProps {
  data: SystemAnalysisData["proposals"];
}

const ProposalsAnalytics = ({ data }: ProposalsAnalyticsProps) => {
  const COLORS = {
    pending: "#F59E0B",
    accepted: "#10B981",
    rejected: "#EF4444",
    withdrawn: "#6B7280",
    shortlisted: "#2E90EB",
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statusDataWithColors = data.statusData.map((item) => ({
    ...item,
    fill: COLORS[item.name as keyof typeof COLORS] || "#6B7280",
  }));

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <FileText className="text-purple-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#134848]">Proposals Analytics</h3>
          <p className="text-sm text-gray-600">Proposal status and bid analysis</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="text-purple-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Total Proposals</p>
              <p className="text-xl font-bold text-purple-600">
                {new Intl.NumberFormat().format(data.total)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <DollarSign className="text-green-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Avg Bid Amount</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(data.averageBidAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-gray-600" />
          <h4 className="font-medium text-gray-900">Status Distribution</h4>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusDataWithColors}
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  (percent as number) > 0.05
                    ? `${name} ${((percent as number) * 100).toFixed(0)}%`
                    : ""
                }
              />
              <Tooltip formatter={(value) => [value, "Proposals"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bid Range Distribution */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={16} className="text-gray-600" />
          <h4 className="font-medium text-gray-900">Bid Range Distribution</h4>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.bidRanges}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [value, name === "count" ? "Proposals" : "Avg Bid"]}
                labelFormatter={(label) => `Range: ${label}`}
              />
              <Bar dataKey="count" fill="#2E90EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {data.statusBreakdown.map((status) => {
            const color = COLORS[status.status as keyof typeof COLORS] || "#6B7280";
            return (
              <div key={status.status} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-gray-600 capitalize">
                  {status.status}: {status.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProposalsAnalytics;
