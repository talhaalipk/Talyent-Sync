// src/store/Admin/disputeStore.ts
import { create } from "zustand";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";

export interface DisputedContract {
  _id: string;
  clientId: {
    _id: string;
    UserName: string;
    email: string;
    profilePic: string;
  };
  freelancerId: {
    _id: string;
    UserName: string;
    email: string;
    profilePic: string;
  };
  jobId: {
    _id: string;
    title: string;
  };
  type: "fixed" | "hourly";
  totalAmount: number;
  escrowBalance: number;
  createdAt: string;
}

export interface DisputeDetails extends DisputedContract {
  clientId: {
    _id: string;
    UserName: string;
    email: string;
    profilePic: string;
    clientProfile?: {
      location?: string;
      companyName?: string;
      companyDescription?: string;
    };
  };
  freelancerId: {
    _id: string;
    UserName: string;
    email: string;
    profilePic: string;
    freelancerProfile?: {
      bio_desc?: string;
      location?: string;
      skills?: string[];
      hourlyRate?: number;
    };
  };
  jobId: {
    _id: string;
    title: string;
    description: string;
    category: string;
    skillsRequired: string[];
  };
  Hourtract?: {
    title: string;
    description: string;
    hoursWork: number;
    status: "awaiting_approval" | "reject" | "approved";
    completedAt?: string;
    approvedAt?: string;
  }[];
  status: string;
  hourlyRate?: number;
}

interface DisputeStore {
  // Disputes list
  disputes: DisputedContract[];
  disputesLoading: boolean;

  // Dispute details
  disputeDetails: DisputeDetails | null;
  detailsLoading: boolean;

  // Resolution actions
  resolvingToFreelancer: boolean;
  resolvingToClient: boolean;

  // General
  error: string | null;

  // Actions
  fetchDisputes: () => Promise<void>;
  fetchDisputeDetails: (contractId: string) => Promise<void>;
  resolveToFreelancer: (contractId: string, note?: string) => Promise<boolean>;
  resolveToClient: (contractId: string, note?: string) => Promise<boolean>;
  clearError: () => void;
  clearDisputeDetails: () => void;
}

// Create admin API instance
const adminApi = api.create({
  baseURL: `${import.meta.env.VITE_BACKED_BASE_URL_API}/admin`,
  withCredentials: true,
});

export const useDisputeStore = create<DisputeStore>((set, get) => ({
  // Initial state
  disputes: [],
  disputesLoading: false,
  disputeDetails: null,
  detailsLoading: false,
  resolvingToFreelancer: false,
  resolvingToClient: false,
  error: null,

  // Fetch all disputed contracts
  fetchDisputes: async () => {
    try {
      set({ disputesLoading: true, error: null });

      const response = await adminApi.get("/dashboard/disputes");

      if (response.data.success) {
        set({
          disputes: response.data.contracts,
          disputesLoading: false,
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch disputes");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to fetch disputes";
      set({
        error: errorMessage,
        disputesLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  // Fetch specific dispute details
  fetchDisputeDetails: async (contractId: string) => {
    try {
      set({ detailsLoading: true, error: null });

      const response = await adminApi.get(`/dashboard/disputes/${contractId}`);

      if (response.data.success) {
        set({
          disputeDetails: response.data.contract,
          detailsLoading: false,
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch dispute details");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to fetch dispute details";
      set({
        error: errorMessage,
        detailsLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  // Resolve dispute in favor of freelancer
  resolveToFreelancer: async (contractId: string, note?: string) => {
    try {
      set({ resolvingToFreelancer: true, error: null });

      const response = await adminApi.post(
        `/dashboard/disputes/${contractId}/resolve-to-freelancer`,
        {
          note: note || "",
        }
      );

      if (response.data.success) {
        // Update disputes list by removing resolved dispute
        set((state) => ({
          disputes: state.disputes.filter((dispute) => dispute._id !== contractId),
          resolvingToFreelancer: false,
        }));

        // Update dispute details if it matches
        const { disputeDetails } = get();
        if (disputeDetails && disputeDetails._id === contractId) {
          set({
            disputeDetails: {
              ...disputeDetails,
              status: "admin_approved",
            },
          });
        }

        toast.success("Dispute resolved in favor of freelancer successfully");
        return true;
      } else {
        throw new Error(response.data.message || "Failed to resolve dispute");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to resolve dispute";
      set({ resolvingToFreelancer: false });
      toast.error(errorMessage);
      return false;
    }
  },

  // Resolve dispute in favor of client
  resolveToClient: async (contractId: string, note?: string) => {
    try {
      set({ resolvingToClient: true, error: null });

      const response = await adminApi.post(`/dashboard/disputes/${contractId}/resolve-to-client`, {
        note: note || "",
      });

      if (response.data.success) {
        // Update disputes list by removing resolved dispute
        set((state) => ({
          disputes: state.disputes.filter((dispute) => dispute._id !== contractId),
          resolvingToClient: false,
        }));

        // Update dispute details if it matches
        const { disputeDetails } = get();
        if (disputeDetails && disputeDetails._id === contractId) {
          set({
            disputeDetails: {
              ...disputeDetails,
              status: "admin_approved",
            },
          });
        }

        toast.success("Dispute resolved in favor of client successfully");
        return true;
      } else {
        throw new Error(response.data.message || "Failed to resolve dispute");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to resolve dispute";
      set({ resolvingToClient: false });
      toast.error(errorMessage);
      return false;
    }
  },

  clearError: () => set({ error: null }),

  clearDisputeDetails: () => set({ disputeDetails: null }),
}));
