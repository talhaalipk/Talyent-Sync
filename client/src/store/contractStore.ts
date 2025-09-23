// src/store/contractStore.ts
import { create } from "zustand";
import api from "../utils/axiosInstance";
import toast from "react-hot-toast";

// Types
export interface Contract {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    description: string;
    category: string;
    subcategory: string;
    jobType: "fixed" | "hourly";
    budget: {
      jobType: "fixed" | "hourly";
      amount?: number;
      hourlyRate?: {
        min: number;
        max: number;
      };
      currency: string;
    };
    duration: {
      estimate: string;
      startDate?: string;
      endDate?: string;
    };
    skillsRequired: string[];
    experienceLevel: "entry" | "intermediate" | "expert";
    status: string;
  };
  client?: {
    _id: string;
    name: string;
    UserName: string;
    email: string;
    profilePic: string;
    clientProfile: {
      companyName?: string;
      companyDescription?: string;
      location?: string;
      clientRating?: number;
    };
  };
  freelancer?: {
    _id: string;
    name: string;
    UserName: string;
    email: string;
    profilePic: string;
    freelancerProfile: {
      bio_desc: string;
      location?: string;
      skills: string[];
      hourlyRate?: number;
      ratingAvg?: number;
      successRate?: number;
    };
  };
  proposal?: {
    _id: string;
    proposalId?: string;
    proposalDesc: string;
    bidAmount?: number;
    estimatedDelivery?: string;
  };
  type: "fixed" | "hourly";
  totalAmount?: number;
  hourlyRate?: number;
  Hourtract?: TimesheetEntry[];
  status: "awaiting_approval" | "active" | "completed" | "disputed";
  escrowBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimesheetEntry {
  _id: string;
  title: string;
  description: string;
  hoursWork: number;
  status: "awaiting_approval" | "reject" | "approved";
  completedAt?: string;
  approvedAt?: string;
}

export interface AddTimesheetData {
  title: string;
  description: string;
  hoursWork: number;
}

export interface TimesheetApprovalData {
  timesheetId: string;
  status: "approved" | "reject";
  rejectionReason?: string;
}

export interface CompletionResponseData {
  action: "accept" | "reject";
  feedback?: string;
}

type ContractStore = {
  contracts: Contract[];
  currentContract: Contract | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchActiveJobs: () => Promise<void>;
  fetchContractDetails: (contractId: string) => Promise<void>;
  addTimesheet: (contractId: string, data: AddTimesheetData) => Promise<void>;
  updateTimesheetStatus: (contractId: string, data: TimesheetApprovalData) => Promise<void>;
  requestCompletion: (contractId: string) => Promise<void>;
  handleCompletionResponse: (contractId: string, data: CompletionResponseData) => Promise<void>;

  // Utility functions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCurrentContract: () => void;
  clearContracts: () => void;
};

export const useContractStore = create<ContractStore>((set, get) => ({
  contracts: [],
  currentContract: null,
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearCurrentContract: () => set({ currentContract: null }),
  clearContracts: () => set({ contracts: [], currentContract: null }),

  fetchActiveJobs: async () => {
    try {
      set({ loading: true, error: null });

      const response = await api.get("/contracts/active-jobs");

      if (response.data.success) {
        set({
          contracts: response.data.contracts,
          loading: false,
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch contracts");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to fetch Contracts";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error(errorMessage);
    }
  },

  fetchContractDetails: async (contractId: string) => {
    try {
      set({ loading: true, error: null });

      const response = await api.get(`/contracts/active-job/${contractId}`);

      if (response.data.success) {
        set({
          currentContract: response.data.contract,
          loading: false,
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch contract details");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to fetch contract details";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error(errorMessage);
    }
  },

  addTimesheet: async (contractId: string, data: AddTimesheetData) => {
    try {
      set({ loading: true, error: null });

      const response = await api.post(`/contracts/active-job/${contractId}/add-timesheet`, data);

      if (response.data.success) {
        // Refresh contract details to show new timesheet
        await get().fetchContractDetails(contractId);
        toast.success("Timesheet added successfully");
      } else {
        throw new Error(response.data.message || "Failed to add timesheet");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to add timesheet";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error(errorMessage);
    }
  },

  updateTimesheetStatus: async (contractId: string, data: TimesheetApprovalData) => {
    try {
      set({ loading: true, error: null });

      const response = await api.patch(
        `/contracts/active-job/${contractId}/timesheet-approval`,
        data
      );

      if (response.data.success) {
        // Refresh contract details to show updated status
        await get().fetchContractDetails(contractId);
        toast.success(
          `Timesheet ${data.status === "approved" ? "approved" : "rejected"} successfully`
        );
      } else {
        throw new Error(response.data.message || "Failed to update timesheet status");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to update timesheet status";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error(errorMessage);
    }
  },

  requestCompletion: async (contractId: string) => {
    try {
      set({ loading: true, error: null });

      const response = await api.patch(`/contracts/active-job/${contractId}/request-completion`);

      if (response.data.success) {
        // Refresh contract details to show updated status
        await get().fetchContractDetails(contractId);
        toast.success("Completion request submitted successfully");
      } else {
        throw new Error(response.data.message || "Failed to request completion");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to request completion";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error(errorMessage);
    }
  },

  handleCompletionResponse: async (contractId: string, data: CompletionResponseData) => {
    try {
      set({ loading: true, error: null });

      const response = await api.patch(
        `/contracts/active-job/${contractId}/completion-response`,
        data
      );

      if (response.data.success) {
        // Refresh both contract details and active jobs list
        await get().fetchContractDetails(contractId);
        await get().fetchActiveJobs();
        toast.success(
          `Contract ${data.action === "accept" ? "approved" : "disputed"} successfully`
        );
      } else {
        throw new Error(response.data.message || "Failed to process completion response");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to process completion response";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error(errorMessage);
    }
  },
}));
