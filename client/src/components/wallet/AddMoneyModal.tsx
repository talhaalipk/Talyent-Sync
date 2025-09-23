// components/wallet/AddMoneyModal.tsx
import { useState } from "react";
import { X, CreditCard } from "lucide-react";
import { useWalletStore } from "../../store/walletStore";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

export function AddMoneyModal() {
  const { showAddMoneyModal, setShowAddMoneyModal, deposit, isProcessing, error, setError } =
    useWalletStore();

  const [amount, setAmount] = useState("");
  const [localError, setLocalError] = useState("");

  const handleClose = () => {
    setShowAddMoneyModal(false);
    setAmount("");
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

    if (amountNum > 10000) {
      setLocalError("Maximum deposit amount is $10,000");
      return;
    }

    try {
      const stripeUrl = await deposit(amountNum);
      // Redirect to Stripe checkout
      window.location.href = stripeUrl;
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  if (!showAddMoneyModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Add Money</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <Input
              label="Amount ($)"
              type="number"
              placeholder="Enter amount to add"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max="10000"
              step="0.01"
              required
            />
            <p className="text-xs text-gray-500 mt-2">Minimum: $1.00 • Maximum: $10,000.00</p>
          </div>

          {/* Error Display */}
          {(localError || error) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{localError || error}</p>
            </div>
          )}

          {/* Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Secure Payment:</strong> You'll be redirected to Stripe's secure checkout page
              to complete your payment.
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
                text={isProcessing ? "Processing..." : "Continue to Payment"}
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
