// stores/walletStore.ts
import { create } from "zustand";
import api from "../utils/axiosInstance";

export interface LedgerEntry {
  type: string;
  amount: number;
  contractId?: string;
  note: string;
  createdAt: string;
}

export interface WalletData {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  availableBalance: number;
  pendingBalance: number;
  totalEarning: number;
  totalWithdraw: number;
  ledger: LedgerEntry[];
  createdAt: string;
}

interface WalletState {
  wallet: WalletData | null;
  isLoading: boolean;
  error: string | null;

  // Modals state
  showAddMoneyModal: boolean;
  showWithdrawModal: boolean;
  isProcessing: boolean;

  // Actions
  fetchWallet: (userId: string) => Promise<void>;
  deposit: (amount: number) => Promise<string>; // Returns Stripe URL
  withdraw: (amount: number, accountNumber: string, pin: string) => Promise<void>;
  addLedgerEntry: (data: {
    clientId: string;
    freelancerId: string;
    contractId: string;
    type: "escrow_funded" | "escrow_released" | "refund";
    amount: number;
    note: string;
  }) => Promise<void>;

  // Modal controls
  setShowAddMoneyModal: (show: boolean) => void;
  setShowWithdrawModal: (show: boolean) => void;
  setIsProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  clearWallet: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  isLoading: false,
  error: null,
  showAddMoneyModal: false,
  showWithdrawModal: false,
  isProcessing: false,

  fetchWallet: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/payment/wallet/${userId}`);
      set({ wallet: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch wallet",
        isLoading: false,
      });
    }
  },

  deposit: async (amount: number): Promise<string> => {
    set({ isProcessing: true, error: null });
    try {
      const response = await api.post("/payment/deposit", { amount });
      set({ isProcessing: false, showAddMoneyModal: false });
      return response.data.url; // Stripe checkout URL
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to process deposit",
        isProcessing: false,
      });
      throw error;
    }
  },

  withdraw: async (amount: number, accountNumber: string, pin: string) => {
    console.log("accountNumber : ", accountNumber);
    console.log("pin : ", pin);
    set({ isProcessing: true, error: null });
    try {
      await api.post("/payment/withdraw", { amount });
      set({ isProcessing: false, showWithdrawModal: false });

      // Refresh wallet data after successful withdrawal
      const { wallet } = get();
      if (wallet?.user._id) {
        await get().fetchWallet(wallet.user._id);
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to process withdrawal",
        isProcessing: false,
      });
      throw error;
    }
  },

  addLedgerEntry: async (data) => {
    try {
      await api.post("/payment/addLedgerEntry", data);
    } catch (error: any) {
      console.error("Failed to add ledger entry:", error.response?.data?.message);
      throw error;
    }
  },

  setShowAddMoneyModal: (show) => set({ showAddMoneyModal: show }),
  setShowWithdrawModal: (show) => set({ showWithdrawModal: show }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  setError: (error) => set({ error }),
  clearWallet: () => set({ wallet: null, error: null, isLoading: false }),
}));
