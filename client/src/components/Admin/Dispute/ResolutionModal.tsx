// src/components/Admin/Dispute/ResolutionModal.tsx
import { useState } from "react";
import { X, AlertTriangle, DollarSign, User } from "lucide-react";

interface ResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (type: "freelancer" | "client", note: string) => void;
  resolutionType: "freelancer" | "client";
  amount: number;
  recipientName: string;
  isResolving: boolean;
}

const ResolutionModal = ({
  isOpen,
  onClose,
  onResolve,
  resolutionType,
  amount,
  recipientName,
  isResolving,
}: ResolutionModalProps) => {
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResolve(resolutionType, note.trim());
  };

  const handleClose = () => {
    if (!isResolving) {
      onClose();
      setNote("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#134848]">Resolve Dispute</h2>
          <button
            onClick={handleClose}
            disabled={isResolving}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-medium text-amber-800 mb-1">Final Decision</h3>
                <p className="text-sm text-amber-700">
                  This action cannot be undone. The escrowed payment will be released immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Resolution Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              {resolutionType === "freelancer" ? (
                <User className="text-blue-600" size={20} />
              ) : (
                <DollarSign className="text-green-600" size={20} />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {resolutionType === "freelancer" ? "Release to Freelancer" : "Refund to Client"}
                </p>
                <p className="text-sm text-gray-600">Payment recipient: {recipientName}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount to transfer:</span>
                <span className="font-semibold text-lg text-[#134848]">
                  {formatCurrency(amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Note Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Note (Optional)
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note explaining the resolution decision..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#134848] focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
                disabled={isResolving}
              />
              <p className="text-xs text-gray-500 mt-1">{note.length}/500 characters</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isResolving}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isResolving}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  resolutionType === "freelancer"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isResolving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  `Confirm ${resolutionType === "freelancer" ? "Release" : "Refund"}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResolutionModal;
