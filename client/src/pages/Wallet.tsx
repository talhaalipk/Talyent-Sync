// pages/Wallet.tsx
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useWalletStore } from "../store/walletStore";
import { WalletMainBalances } from "../components/wallet/WalletMainBalances";
import { WalletTransactions } from "../components/wallet/WalletTransactions";
import { AddMoneyModal } from "../components/wallet/AddMoneyModal";
import { WithdrawMoneyModal } from "../components/wallet/WithdrawMoneyModal";
import PleaseLogin from "../components/PleaseLogin";
import { AlertTriangle } from "lucide-react";

export default function Wallet() {
  const { isLoggedIn, user, verifylogin } = useAuthStore();
  const { fetchWallet, wallet, isLoading, error, clearWallet } = useWalletStore();

  useEffect(() => {
    // Verify login status on component mount
    verifylogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Fetch wallet data when user is logged in
    if (isLoggedIn && user?._id) {
      console.log("before fetchWallet ");
      fetchWallet(user._id);
    } else {
      // Clear wallet data when user logs out
      clearWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user?.id]);

  // Show login component if user is not logged in
  if (!isLoggedIn) {
    return <PleaseLogin />;
  }

  // Show error state if there's an error fetching wallet
  console.log("error : ", error);
  console.log("isLoading : ", isLoading);
  if (error && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#134848]">Wallet Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your funds and transactions</p>
        </header>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Wallet</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => user?.id && fetchWallet(user.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#134848]">Wallet Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your funds and transactions
          {wallet?.user && (
            <span className="ml-2 text-sm bg-[#134848] text-white px-2 py-1 rounded capitalize">
              {wallet.user.role}
            </span>
          )}
        </p>
      </header>

      {/* Loading State */}
      {isLoading && !wallet && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Only show when not loading or when wallet data is available */}
      {(!isLoading || wallet) && (
        <>
          {/* Main Balances */}
          <WalletMainBalances />

          {/* Transaction History */}
          <WalletTransactions />
        </>
      )}

      {/* Modals */}
      <AddMoneyModal />
      <WithdrawMoneyModal />
    </div>
  );
}
