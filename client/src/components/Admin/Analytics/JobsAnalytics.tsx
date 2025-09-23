// src/components/Admin/Analytics/JobsAnalytics.tsx
import { Briefcase, TrendingUp, Target } from "lucide-react";
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
  Cell,
} from "recharts";
import type { SystemAnalysisData } from "../../../store/Admin/systemAnalysisStore";

interface JobsAnalyticsProps {
  data: SystemAnalysisData["jobs"];
}

const JobsAnalytics = ({ data }: JobsAnalyticsProps) => {
  const COLORS = [
    "#2E90EB",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
  ];

  const experienceLevelColors = {
    entry: "#10B981",
    intermediate: "#F59E0B",
    expert: "#EF4444",
  };

  const experienceData = data.experienceLevels.map((item) => ({
    ...item,
    fill: experienceLevelColors[item.level as keyof typeof experienceLevelColors] || "#6B7280",
  }));

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Briefcase className="text-green-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#134848]">Jobs Analytics</h3>
          <p className="text-sm text-gray-600">Job distribution and categories</p>
        </div>
      </div>

      {/* Experience Level Chart */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-gray-600" />
          <h4 className="font-medium text-gray-900">Experience Levels</h4>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={experienceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="level"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [value, "Jobs"]}
                labelFormatter={(label) =>
                  `Level: ${label.charAt(0).toUpperCase() + label.slice(1)}`
                }
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Categories Pie Chart */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-gray-600" />
          <h4 className="font-medium text-gray-900">Top Categories</h4>
        </div>

        {/* Show top 5 categories */}
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.categoryData.sort((a, b) => b.value - a.value).slice(0, 5)}
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  (percent as number) > 0.05
                    ? `${name.split(" ")[0]} ${((percent as number) * 100).toFixed(0)}%`
                    : ""
                }
              >
                {data.categoryData
                  .slice(0, 5)
                  .map(
                    (entry, index) => (
                      console.log("entry:", entry),
                      (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                    )
                  )}
              </Pie>
              <Tooltip formatter={(value) => [value, "Jobs"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Legend */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {data.categories
            .sort((a, b) => b.count - a.count)
            .slice(0, 4)
            .map((category, index) => (
              <div key={category.category} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-600 truncate">
                  {category.category.replace("-", " ")}: {category.count}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Jobs:</span>
            <span className="font-semibold text-[#134848] ml-2">
              {new Intl.NumberFormat().format(data.total)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Top Category:</span>
            <span className="font-semibold text-green-600 ml-2">
              {data.categories.sort((a, b) => b.count - a.count)[0]?.category.replace("-", " ") ||
                "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsAnalytics;
