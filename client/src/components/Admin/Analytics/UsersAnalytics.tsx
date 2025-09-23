// src/components/Admin/Analytics/UsersAnalytics.tsx
import { Users, UserCheck, UserPlus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { SystemAnalysisData } from "../../../store/Admin/systemAnalysisStore";

interface UsersAnalyticsProps {
  data: SystemAnalysisData["users"];
}

const UsersAnalytics = ({ data }: UsersAnalyticsProps) => {
  const COLORS = ["#2E90EB", "#10B981", "#F59E0B", "#EF4444"];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
          <p className="text-sm text-gray-600">
            {`${((payload[0].value / data.total) * 100).toFixed(1)}% of total users`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Users className="text-blue-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#134848]">User Analytics</h3>
          <p className="text-sm text-gray-600">Distribution of platform users</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <UserCheck className="text-blue-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Freelancers</p>
              <p className="text-xl font-bold text-blue-600">
                {new Intl.NumberFormat().format(data.freelancers)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <UserPlus className="text-green-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Clients</p>
              <p className="text-xl font-bold text-green-600">
                {new Intl.NumberFormat().format(data.clients)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.userTypeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${((percent as number) * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.userTypeData.map(
                (entry, index) => (
                  console.log("Entry:", entry),
                  (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                )
              )}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Users:</span>
          <span className="font-semibold text-[#134848]">
            {new Intl.NumberFormat().format(data.total)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600">Freelancer Ratio:</span>
          <span className="font-semibold text-blue-600">
            {((data.freelancers / data.total) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600">Client Ratio:</span>
          <span className="font-semibold text-green-600">
            {((data.clients / data.total) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default UsersAnalytics;
