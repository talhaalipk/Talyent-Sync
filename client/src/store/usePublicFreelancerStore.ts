import { create } from "zustand";
import api from "../utils/axiosInstance";

export interface PortfolioItem {
  title: string;
  url: string;
  description?: string;
}

export interface Certification {
  title: string;
  issuer: string;
  year?: number;
}

export interface RecentContract {
  jobTitle: string;
  jobCategory: string;
  clientName: string;
  type: "fixed" | "hourly";
  amount: number | string;
  completedAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  jobTitle: string;
  client: {
    name: string;
    profilePic?: string;
  };
}

export interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  awaitingApproval: number;
}

export interface PublicFreelancerProfile {
  id: string;
  name: string;
  username: string;
  profilePic?: string;
  memberSince: string;
  bio: string;
  location: string;
  skills: string[];
  hourlyRate: number;
  successRate: number;
  ratingAvg: number;
  ratingCount: number;
  portfolio: PortfolioItem[];
  certifications: Certification[];
  totalEarnings: number;
  contractStats: ContractStats;
  recentContracts: RecentContract[];
  reviews: Review[];
}

interface PublicFreelancerState {
  freelancer: PublicFreelancerProfile | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchFreelancerProfile: (id: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const usePublicFreelancerStore = create<PublicFreelancerState>((set) => ({
  freelancer: null,
  loading: false,
  error: null,

  fetchFreelancerProfile: async (id: string) => {
    set({ loading: true, error: null });

    try {
      const response = await api.get(`/public/freelancer/${id}`);

      if (response.data.success) {
        set({
          freelancer: response.data.data,
          loading: false,
          error: null,
        });
      } else {
        set({
          loading: false,
          error: "Failed to fetch freelancer profile",
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to fetch freelancer profile";

      set({
        loading: false,
        error: errorMessage,
        freelancer: null,
      });
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      freelancer: null,
      loading: false,
      error: null,
    }),
}));
