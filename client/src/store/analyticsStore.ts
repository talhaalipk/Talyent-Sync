// src/store/analyticsStore.ts
import { create } from "zustand";
import api from "../utils/axiosInstance";
import toast from "react-hot-toast";

// Types for Client Analytics
export interface ClientAnalytics {
  contractStats: {
    awaiting_approval: number;
    active: number;
    completed: number;
    disputed: number;
    total: number;
    totalSpent: number;
  };
  successRate: number;
  hourlyRates: {
    averageHourlyRate: number;
    minRate: number;
    maxRate: number;
    totalHourlyContracts: number;
  };
  fixedRates: {
    averageFixedRate: number;
    minAmount: number;
    maxAmount: number;
    totalFixedContracts: number;
  };
  monthlyTrends: Array<{
    _id: { year: number; month: number };
    contracts: number;
    spending: number;
  }>;
}

// Types for Freelancer Analytics
export interface FreelancerAnalytics {
  walletStats: {
    availableBalance: number;
    pendingBalance: number;
    totalEarnings: number;
    totalWithdrawn: number;
  };
  contractStats: {
    awaiting_approval: number;
    active: number;
    completed: number;
    disputed: number;
    total: number;
    totalEarned: number;
  };
  successRate: number;
  proposalStats: {
    total: number;
    accepted: number;
    proposalToHireRatio: number;
  };
  monthlyEarnings: Array<{
    _id: { year: number; month: number };
    earnings: number;
    contracts: number;
  }>;
  contractTypeStats: Array<{
    _id: string;
    count: number;
    earnings: number;
  }>;
}

type AnalyticsStore = {
  clientAnalytics: ClientAnalytics | null;
  freelancerAnalytics: FreelancerAnalytics | null;
  userRole: "client" | "freelancer" | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchAnalytics: () => Promise<void>;
  clearAnalytics: () => void;

  // Utility functions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  clientAnalytics: null,
  freelancerAnalytics: null,
  userRole: null,
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearAnalytics: () =>
    set({
      clientAnalytics: null,
      freelancerAnalytics: null,
      userRole: null,
      error: null,
    }),

  fetchAnalytics: async () => {
    try {
      set({ loading: true, error: null });

      const response = await api.get("/analytics/my-stats");

      if (response.data.success) {
        const { data, role } = response.data;

        if (role === "client") {
          set({
            clientAnalytics: data,
            freelancerAnalytics: null,
            userRole: "client",
            loading: false,
          });
        } else if (role === "freelancer") {
          set({
            freelancerAnalytics: data,
            clientAnalytics: null,
            userRole: "freelancer",
            loading: false,
          });
        }
      } else {
        throw new Error(response.data.message || "Failed to fetch analytics");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to fetch analytics";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error(errorMessage);
    }
  },
}));
