import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance"; // adjust path to your api.ts
import toast from "react-hot-toast";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  useEffect(() => {
    const confirmDeposit = async () => {
      const sessionId = searchParams.get("session_id");
      if (!sessionId) {
        toast.error("Missing session ID");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`payment/confirm-deposit?session_id=${sessionId}`);
        setWallet(res.data.wallet);
        toast.success("Deposit successful!");
      } catch (err: any) {
        console.error("❌ Confirm deposit error:", err);
        toast.error(err.response?.data?.message || "Deposit failed!");
      } finally {
        setLoading(false);
      }
    };

    confirmDeposit();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
      <div className="bg-white shadow-md rounded-2xl p-8 max-w-md w-full text-center">
        {loading ? (
          <p className="text-gray-600 text-lg">Confirming your payment...</p>
        ) : wallet ? (
          <>
            <h1 className="text-2xl font-bold text-[#134848] mb-4">Payment Successful 🎉</h1>
            <p className="text-gray-700 mb-6">
              ${wallet.availableBalance.toFixed(2)} is now available in your wallet.
            </p>
            <button
              onClick={() => navigate("/dashboard")} // redirect wherever you want
              className="bg-[#2E90EB] text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 transition"
            >
              Go to Dashboard
            </button>
          </>
        ) : (
          <p className="text-red-600 text-lg">Payment could not be confirmed.</p>
        )}
      </div>
    </div>
  );
}
