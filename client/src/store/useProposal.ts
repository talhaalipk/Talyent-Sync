import { create } from "zustand";
import api from "../utils/axiosInstance";
import toast from "react-hot-toast";

export interface Proposal {
  _id: string;
  proposalDesc: string;
  bidAmount: number;
  status: "pending" | "accepted" | "rejected" | "withdrawn" | "shortlisted";
  estimatedDelivery?: string;
  createdAt: string;
  document: string;
  // For freelancer sent
  receiverId?: {
    _id: string;
    name: string;
    UserName: string;
    profilePic: string;
    clientProfile?: {
      companyName?: string;
    };
  };

  // For client received
  senderId?: {
    _id: string;
    name: string;
    UserName: string;
    profilePic: string;
    freelancerProfile?: {
      ratingAvg: number;
      skills: string[];
    };
  };

  jobId: {
    _id: string;
    title: string;
    budget: {
      amount?: number;
      jobType: "fixed" | "hourly";
    };
    jobType: "fixed" | "hourly";
    status: string;
  };
}

interface ProposalState {
  proposals: Proposal[];
  receivedProposals: Proposal[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    total: number;
    count: number;
    totalProposals: number;
  } | null;

  fetchSentProposals: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchReceivedProposals: (params?: {
    jobId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  updateProposalStatus: (
    id: string,
    status: "accepted" | "rejected" | "shortlisted"
  ) => Promise<void>;
}

export const useProposalStore = create<ProposalState>((set, get) => ({
  proposals: [],
  receivedProposals: [],
  loading: false,
  error: null,
  pagination: null,

  // ✅ Fetch sent proposals (Freelancer)
  fetchSentProposals: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await api.get(`/proposal/sent?${query}`);
      if (res.data.success) {
        set({
          proposals: res.data.data,
          pagination: res.data.pagination,
          loading: false,
        });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to fetch proposals";
      toast.error(msg);
      set({ error: msg, loading: false });
    }
  },

  // ✅ Fetch received proposals (Client)
  fetchReceivedProposals: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await api.get(`/proposal/received?${query}`);
      if (res.data.success) {
        set({
          receivedProposals: res.data.data,
          pagination: res.data.pagination,
          loading: false,
        });
        console.log("persosal", res.data.data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to fetch received proposals";
      toast.error(msg);
      set({ error: msg, loading: false });
    }
  },

  // ✅ Update Proposal Status (Client Accept/Reject)
  updateProposalStatus: async (id, status) => {
    const toastId = toast.loading("Updating proposal..."); // ⏳ show loading toast

    try {
      const res = await api.patch(`/proposal/${id}/status`, { status });
      if (res.data.success) {
        toast.success("Proposal updated successfully!", { id: toastId });
        const updatedList = get().receivedProposals.map((p) =>
          p._id === id ? { ...p, status } : p
        );
        set({ receivedProposals: updatedList });
      } else {
        toast.error(res.data.message || "Failed to update proposal", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update proposal", { id: toastId });
    }
  },
}));
