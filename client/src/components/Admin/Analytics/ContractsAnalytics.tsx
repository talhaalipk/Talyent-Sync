// src/components/Admin/Analytics/ContractsAnalytics.tsx
import { CreditCard, Clock, CheckCircle, DollarSign } from "lucide-react";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { SystemAnalysisData } from "../../../store/Admin/systemAnalysisStore";

interface ContractsAnalyticsProps {
  data: SystemAnalysisData["contracts"];
}

const ContractsAnalytics = ({ data }: ContractsAnalyticsProps) => {
  const STATUS_COLORS = {
    awaiting_approval: "#F59E0B",
    active: "#2E90EB",
    completed: "#10B981",
    disputed: "#EF4444",
  };

  const TYPE_COLORS = {
    fixed: "#2E90EB",
    hourly: "#10B981",
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
    fill: STATUS_COLORS[item.name as keyof typeof STATUS_COLORS] || "#6B7280",
  }));

  const typeDataWithColors = data.typeData.map((item) => ({
    ...item,
    fill: TYPE_COLORS[item.name as keyof typeof TYPE_COLORS] || "#6B7280",
  }));

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <CreditCard className="text-orange-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#134848]">Contracts Analytics</h3>
          <p className="text-sm text-gray-600">Contract status and payment analysis</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <CreditCard className="text-orange-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Total Contracts</p>
              <p className="text-xl font-bold text-orange-600">
                {new Intl.NumberFormat().format(data.total)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <DollarSign className="text-green-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Avg Contract Value</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(data.averageAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contract Status */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-gray-600" />
            <h4 className="font-medium text-gray-900">Contract Status</h4>
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
                  label={({ percent }) =>
                    (percent as number) > 0.08 ? `${((percent as number) * 100).toFixed(0)}%` : ""
                  }
                />
                <Tooltip formatter={(value) => [value, "Contracts"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Legend */}
          <div className="grid grid-cols-1 gap-1 text-xs">
            {data.statusBreakdown.map((status) => {
              const color = STATUS_COLORS[status.status as keyof typeof STATUS_COLORS] || "#6B7280";
              return (
                <div key={status.status} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-gray-600 capitalize">
                    {status.status.replace("_", " ")}: {status.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contract Type */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={16} className="text-gray-600" />
            <h4 className="font-medium text-gray-900">Contract Type</h4>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeDataWithColors}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [value, "Contracts"]}
                  labelFormatter={(label) =>
                    `Type: ${label.charAt(0).toUpperCase() + label.slice(1)}`
                  }
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Type Summary */}
          <div className="mt-4 space-y-2">
            {data.typeBreakdown.map((type) => {
              const percentage = ((type.count / data.total) * 100).toFixed(1);
              return (
                <div key={type.type} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 capitalize">{type.type}:</span>
                  <span className="font-semibold text-[#134848]">
                    {type.count} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Active Contracts:</span>
            <span className="font-semibold text-blue-600 ml-2">
              {data.statusBreakdown.find((s) => s.status === "active")?.count || 0}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Completed Contracts:</span>
            <span className="font-semibold text-green-600 ml-2">
              {data.statusBreakdown.find((s) => s.status === "completed")?.count || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractsAnalytics;
