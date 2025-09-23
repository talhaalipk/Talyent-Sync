// src/store/Admin/systemAnalysisStore.ts
import { create } from "zustand";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";

export interface SystemAnalysisData {
  users: {
    total: number;
    freelancers: number;
    clients: number;
    userTypeData: { name: string; value: number }[];
  };
  jobs: {
    total: number;
    experienceLevels: { level: string; count: number }[];
    categories: { category: string; count: number }[];
    experienceLevelData: { name: string; value: number }[];
    categoryData: { name: string; value: number }[];
  };
  proposals: {
    total: number;
    statusBreakdown: { status: string; count: number }[];
    averageBidAmount: number;
    bidRanges: { range: string; count: number; avgBid: number }[];
    statusData: { name: string; value: number }[];
  };
  contracts: {
    total: number;
    statusBreakdown: { status: string; count: number }[];
    typeBreakdown: { type: string; count: number }[];
    averageAmount: number;
    statusData: { name: string; value: number }[];
    typeData: { name: string; value: number }[];
  };
  payments: {
    totalEscrowInSystem: number;
    totalAvailableBalance: number;
    totalPendingBalance: number;
    totalEarnings: number;
    escrowData: { name: string; value: number }[];
  };
}

interface SystemAnalysisStore {
  data: SystemAnalysisData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  fetchSystemAnalysis: () => Promise<void>;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

// Create admin API instance
const adminApi = api.create({
  baseURL: `${import.meta.env.VITE_BACKED_BASE_URL_API}/admin`,
  withCredentials: true,
});

export const useSystemAnalysisStore = create<SystemAnalysisStore>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  lastUpdated: null,

  fetchSystemAnalysis: async () => {
    try {
      set({ loading: true, error: null });

      const response = await adminApi.get("/dashboard/system-analysis");

      if (response.data.success) {
        set({
          data: response.data.data,
          loading: false,
          lastUpdated: new Date(),
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch system analysis");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to fetch system analysis";
      set({
        error: errorMessage,
        loading: false,
        data: null,
      });
      toast.error(errorMessage);
    }
  },

  refreshData: async () => {
    const { fetchSystemAnalysis } = get();
    await fetchSystemAnalysis();
    toast.success("System analysis data refreshed");
  },

  clearError: () => set({ error: null }),
}));
