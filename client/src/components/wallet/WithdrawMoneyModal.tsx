// components/wallet/WithdrawMoneyModal.tsx
import { useState } from "react";
import { X, ArrowUpCircle } from "lucide-react";
import { useWalletStore } from "../../store/walletStore";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import toast from "react-hot-toast";

export function WithdrawMoneyModal() {
  const {
    showWithdrawModal,
    setShowWithdrawModal,
    withdraw,
    isProcessing,
    error,
    setError,
    wallet,
  } = useWalletStore();

  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [pin, setPin] = useState("");
  const [localError, setLocalError] = useState("");

  const handleClose = () => {
    setShowWithdrawModal(false);
    setAmount("");
    setAccountNumber("");
    setPin("");
    setLocalError("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setError(null);

    const amountNum = parseFloat(amount);

    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setLocalError("Please enter a valid amount greater than $0");
      return;
    }

    if (!wallet) {
      setLocalError("Wallet data not available");
      return;
    }

    if (amountNum > wallet.availableBalance) {
      setLocalError(`Insufficient balance. Available: $${wallet.availableBalance.toFixed(2)}`);
      return;
    }

    if (!accountNumber || accountNumber.length < 8) {
      setLocalError("Please enter a valid account number (minimum 8 digits)");
      return;
    }

    if (!pin || pin.length !== 4) {
      setLocalError("Please enter a 4-digit PIN");
      return;
    }

    try {
      await withdraw(amountNum, accountNumber, pin);
      // Show success message (you can implement a toast here)
      toast.success("Withdrawal successful! Processing time: 1-2 business days.");
      handleClose();
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  };

  if (!showWithdrawModal) return null;

  const availableBalance = wallet?.availableBalance || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ArrowUpCircle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Withdraw Money</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Available Balance */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Available Balance</p>
            <p className="text-2xl font-bold text-[#134848]">${availableBalance.toFixed(2)}</p>
          </div>

          <div className="space-y-4 mb-6">
            <Input
              label="Amount ($)"
              type="number"
              placeholder="Enter amount to withdraw"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={availableBalance.toString()}
              step="0.01"
              required
            />

            <Input
              label="Account Number"
              type="text"
              placeholder="Enter your bank account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
              maxLength={20}
              required
            />

            <Input
              label="4-Digit PIN"
              type="password"
              placeholder="Enter your PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              maxLength={4}
              required
            />
          </div>

          {/* Error Display */}
          {(localError || error) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{localError || error}</p>
            </div>
          )}

          {/* Info */}
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-700">
              <strong>Processing Time:</strong> Withdrawals typically take 1-2 business days to
              process.
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <div className="flex-1">
              <Button
                text={isProcessing ? "Processing..." : "Withdraw Money"}
                disabled={isProcessing}
                type="submit"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
