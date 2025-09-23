// components/wallet/WalletMainBalances.tsx
import { DollarSign, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { useWalletStore } from "../../store/walletStore";
import { useAuthStore } from "../../store/authStore";
import Button from "../../ui/Button";

export function WalletMainBalances() {
  const { wallet, setShowAddMoneyModal, setShowWithdrawModal } = useWalletStore();
  const { user } = useAuthStore();
  console.log("wallet -----> : ", wallet);
  if (!wallet) {
    return (
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
    );
  }

  // Calculate total earnings and withdrawals from ledger
  //   const calculateTotals = () => {
  //     if (!wallet.ledger) return { totalEarnings: 0, totalWithdrawn: 0 };

  //     let totalEarnings = 0;
  //     let totalWithdrawn = 0;

  //     wallet.ledger.forEach((entry) => {
  //       switch (entry.type.toLowerCase()) {
  //         case 'escrow_released':
  //         case 'refund':
  //         case 'deposit':
  //           if (entry.amount > 0) totalEarnings += entry.amount;
  //           break;
  //         case 'withdraw':
  //         case 'withdrawal':
  //           if (entry.amount < 0) totalWithdrawn += Math.abs(entry.amount);
  //           break;
  //       }
  //     });

  //     return { totalEarnings, totalWithdrawn };
  //   };

  //   const { totalEarnings, totalWithdrawn } = calculateTotals();
  const isFreelancer = user?.role === "freelancer";

  // Base balances for all users
  const baseBalances = [
    {
      title: "Available Balance",
      value: `$${wallet.availableBalance.toFixed(2)}`,
      subtitle: "Withdrawable funds",
      icon: <DollarSign className="text-[#134848]" />,
    },
    {
      title: "Pending Balance",
      value: `$${wallet.pendingBalance.toFixed(2)}`,
      subtitle: "In escrow waiting approval",
      icon: <Clock className="text-[#134848]" />,
    },
  ];

  // Additional balances for freelancers only
  const freelancerBalances = [
    {
      title: "Total Earnings",
      value: `$${wallet.totalEarning.toFixed(2)}`,
      subtitle: "Lifetime earnings",
      icon: <TrendingUp className="text-[#134848]" />,
    },
    {
      title: "Total Withdrawn",
      value: `$${wallet.totalWithdraw.toFixed(2)}`,
      subtitle: "Lifetime withdrawals",
      icon: <TrendingDown className="text-[#134848]" />,
    },
  ];

  const balances = isFreelancer ? [...baseBalances, ...freelancerBalances] : baseBalances;

  const handleAddMoney = () => {
    setShowAddMoneyModal(true);
  };

  const handleWithdrawMoney = () => {
    setShowWithdrawModal(true);
  };

  return (
    <>
      {/* Balances Grid */}
      <div
        className={`grid grid-cols-1 ${isFreelancer ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2"} gap-6 mb-8`}
      >
        {balances.map((balance, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-700">{balance.title}</h2>
              {balance.icon}
            </div>
            <p className="text-3xl font-bold text-[#134848]">{balance.value}</p>
            <p className="text-sm text-gray-500 mt-1">{balance.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Button
            text="Add Money"
            onClick={handleAddMoney}
            className="w-full bg-[#2E90EB] text-white py-2 rounded-lg font-medium hover:bg-[#134848] transition"
          />
        </div>
        <div className="flex-1">
          <Button
            text="Withdraw Money"
            onClick={handleWithdrawMoney}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-6 rounded-lg border border-gray-200 transition"
          />
        </div>
      </div>
    </>
  );
}
