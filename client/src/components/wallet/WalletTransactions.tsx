import { ArrowDown, ArrowUp, Lock, AlertCircle, RefreshCw, DollarSign } from "lucide-react";
import { useWalletStore } from "../../store/walletStore";
import type { LedgerEntry } from "../../store/walletStore";

export function WalletTransactions() {
  const { wallet } = useWalletStore();

  if (!wallet) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "deposit":
        return <ArrowDown className="text-green-500" />;
      case "withdraw":
      case "withdrawal":
        return <ArrowUp className="text-red-500" />;
      case "escrow_funded":
        return <Lock className="text-blue-500" />;
      case "escrow_released":
        return <DollarSign className="text-green-500" />;
      case "refund":
        return <RefreshCw className="text-yellow-500" />;
      default:
        return <AlertCircle className="text-gray-500" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount >= 0 ? "text-green-600" : "text-red-600";
  };

  const formatTransactionAmount = (amount: number) => {
    const sign = amount >= 0 ? "" : "";
    return `${sign}$${Math.abs(amount).toFixed(2)}`;
  };

  const formatTransactionType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // const getTransactionStatus = (type: string) => {
  //   switch (type.toLowerCase()) {
  //     case "escrow_funded":
  //       return "Pending";
  //     case "deposit":
  //     case "withdraw":
  //     case "withdrawal":
  //     case "escrow_released":
  //     case "refund":
  //       return "Completed";
  //     default:
  //       return "Completed";
  //   }
  // };

  const getTransactionDescription = (entry: LedgerEntry) => {
    switch (entry.type.toLowerCase()) {
      case "deposit":
        return "Stripe Payment • Card ending ••••";
      case "withdraw":
      case "withdrawal":
        return "Bank Transfer • Account ••••";
      case "escrow_funded":
        return `Project Escrow${entry.contractId ? ` • Contract: ${entry.contractId.slice(-8)}` : ""}`;
      case "escrow_released":
        return `Project Payment${entry.contractId ? ` • Contract: ${entry.contractId.slice(-8)}` : ""}`;
      case "refund":
        return `Refund${entry.contractId ? ` • Contract: ${entry.contractId.slice(-8)}` : ""}`;
      default:
        return "Platform Transaction";
    }
  };

  // Sort transactions by date (newest first)
  const sortedTransactions = [...(wallet.ledger || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (sortedTransactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#134848]">Transaction History</h2>
        </div>
        <div className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
          <p className="text-gray-500">
            Your transaction history will appear here once you start using your wallet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-[#134848]">Transaction History</h2>
        <p className="text-sm text-gray-500 mt-1">
          {sortedTransactions.length} transaction{sortedTransactions.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="divide-y divide-gray-100">
        {sortedTransactions.slice(0, 10).map((transaction, i) => (
          <div key={i} className="p-6 hover:bg-gray-50 transition duration-150">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-full bg-gray-50">
                {getTransactionIcon(transaction.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-800">
                    {formatTransactionType(transaction.type)}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <p className={`font-medium ${getTransactionColor(transaction.amount)}`}>
                      {formatTransactionAmount(transaction.amount)}
                    </p>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {/* {getTransactionStatus(transaction.type)} */}
                    </span>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">{getTransactionDescription(transaction)}</p>
                  <p className="text-sm text-gray-500">{transaction.note}</p>
                  <p className="text-xs text-gray-400">{formatDate(transaction.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {sortedTransactions.length > 10 && (
        <div className="p-4 border-t border-gray-100 text-center">
          <button className="text-[#2E90EB] hover:text-blue-600 font-medium text-sm transition duration-150">
            View All {sortedTransactions.length} Transactions
          </button>
        </div>
      )}
    </div>
  );
}
