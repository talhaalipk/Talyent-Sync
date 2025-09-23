// src/store/useJobStore.ts
import { create } from "zustand";
import api from "../utils/axiosInstance"; // your axios setup
import toast from "react-hot-toast";

interface Budget {
  jobType: "fixed" | "hourly";
  amount?: number;
  currency: string;
  hourlyRate?: {
    min: number;
    max: number;
  };
}

interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  jobType: string;
  budget: Budget;
  duration: {
    estimate: string;
    startDate: string;
    endDate: string;
  };
  skillsRequired: string[];
  experienceLevel: string;
  attachments: string[];
  status: string;
  proposalCount: number;
  interviewCount: number;
  hiredCount: number;
  publishedAt: string;
}

interface Client {
  _id: string;
  name: string;
  UserName: string;
  email: string;
  profilePic: string;
  clientProfile?: {
    companyName?: string;
    location?: string;
    clientRating?: number;
  };
}

interface JobStore {
  job: Job | null;
  client: Client | null;
  loading: boolean;
  error: string | null;
  fetchJob: (id: string) => Promise<void>;
}

export const useJobStore = create<JobStore>((set) => ({
  job: null,
  client: null,
  loading: false,
  error: null,

  fetchJob: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const res = await api.get(`/jobs/public/job/${id}`);
      const { job, client } = res.data.data;

      set({ job, client, loading: false, error: null });
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch job details";
      toast.error(message);
      set({ error: message, loading: false });
    }
  },
}));
