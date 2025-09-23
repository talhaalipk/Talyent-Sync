// src/components/Admin/Analytics/PaymentsAnalytics.tsx
import { DollarSign, TrendingUp, Shield, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { SystemAnalysisData } from "../../../store/Admin/systemAnalysisStore";

interface PaymentsAnalyticsProps {
  data: SystemAnalysisData["payments"];
}

const PaymentsAnalytics = ({ data }: PaymentsAnalyticsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatLargeCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <DollarSign className="text-red-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#134848]">Payment System Analytics</h3>
          <p className="text-sm text-gray-600">Escrow and wallet balance overview</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <div className="flex items-center gap-3">
            <Shield className="text-red-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Escrow Balance</p>
              <p className="text-xl font-bold text-red-600">
                {formatLargeCurrency(data.totalEscrowInSystem)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center gap-3">
            <Wallet className="text-green-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-xl font-bold text-green-600">
                {formatLargeCurrency(data.totalAvailableBalance)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-yellow-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Pending Balance</p>
              <p className="text-xl font-bold text-yellow-600">
                {formatLargeCurrency(data.totalPendingBalance)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-3">
            <DollarSign className="text-blue-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-xl font-bold text-blue-600">
                {formatLargeCurrency(data.totalEarnings)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Distribution Chart */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-gray-600" />
            <h4 className="font-medium text-gray-900">Balance Distribution</h4>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.escrowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatLargeCurrency(value)}
                />
                <Tooltip formatter={(value: number) => [formatCurrency(value), "Amount"]} />
                <Bar dataKey="value" fill="#2E90EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health Indicators */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-gray-600" />
            <h4 className="font-medium text-gray-900">System Health</h4>
          </div>

          <div className="space-y-4">
            {/* Escrow Ratio */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Escrow Security</span>
                <span className="text-sm font-semibold text-red-600">
                  {formatCurrency(data.totalEscrowInSystem)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, (data.totalEscrowInSystem / (data.totalEscrowInSystem + data.totalAvailableBalance)) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Funds secured in escrow for active contracts
              </p>
            </div>

            {/* Available vs Pending Ratio */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Liquidity Status</span>
                <span className="text-sm font-semibold text-green-600">
                  {(
                    (data.totalAvailableBalance /
                      (data.totalAvailableBalance + data.totalPendingBalance)) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${(data.totalAvailableBalance / (data.totalAvailableBalance + data.totalPendingBalance)) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">Available funds vs pending balances</p>
            </div>

            {/* Total Platform Value */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-center">
                <p className="text-sm font-medium text-blue-700 mb-1">Total Platform Value</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatLargeCurrency(
                    data.totalEscrowInSystem + data.totalAvailableBalance + data.totalPendingBalance
                  )}
                </p>
                <p className="text-xs text-blue-600 mt-1">Combined system liquidity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsAnalytics;
