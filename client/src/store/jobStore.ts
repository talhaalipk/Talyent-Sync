import { create } from "zustand";
import api from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { useUserStore } from "./userStore";
import { confirmToast } from "../ui/toasterComfirm";

export interface Job {
  _id?: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  jobType: "fixed" | "hourly";
  budget: {
    jobType: "fixed" | "hourly";
    amount?: number;
    hourlyRate?: { min: number; max: number };
    currency: string;
  };
  duration?: {
    estimate?: string;
    startDate?: string;
    endDate?: string;
  };
  skillsRequired?: string[];
  experienceLevel: "entry" | "intermediate" | "expert";
  attachments?: string[];
  status?: "published";
  visibility?: "public" | "private";
  invitedFreelancers?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface JobState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  addJob: (jobData: Job) => Promise<void>;
  fetchJobs: (clientId: string) => Promise<void>; // optional if you want to list later
  deleteJob: (jobId: string) => Promise<boolean>;
  updateJob: (jobId: string, jobData: Job) => Promise<void>;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  loading: false,
  error: null,

  // ✅ Create new job
  addJob: async (jobData: Job) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/jobs/jobadd", jobData);
      if (res.data.success) {
        set((state) => ({
          jobs: [...state.jobs, res.data.data],
          loading: false,
        }));
        const clientId = useUserStore.getState().profile?._id;
        console.log(clientId);
        get().fetchJobs(clientId);
        toast.success("Job created successfully!");
      } else {
        toast.error(res.data.message || "Failed to create job");
        set({ loading: false, error: res.data.message });
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Something went wrong creating job!";
      toast.error(msg);
      set({ loading: false, error: msg });
    }
  },

  // ✅ Fetch client jobs (later use in <MyJobs />)
  fetchJobs: async (profileId?: string) => {
    try {
      set({ loading: true, error: null });

      const res = await api.get(`/jobs/all-jobs/${profileId}`);
      set({ jobs: res.data.data || [] });
      console.log(get().jobs);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to fetch jobs";
      toast.error(msg);
      set({ error: msg });
    } finally {
      set({ loading: false });
    }
  },

  deleteJob: async (jobId: string) => {
    try {
      // 🔹 Ask for confirmation first
      const confirmed = await confirmToast("Are you sure you want to delete this job?");
      if (!confirmed) {
        return false; // user canceled
      }

      const res = await api.delete(`/jobs/jobdelete/${jobId}`);
      if (res.data.success) {
        toast.success("Job deleted successfully");

        // 🔹 remove job locally by refetching
        const clientId = useUserStore.getState().profile?._id;
        if (clientId) {
          await get().fetchJobs(clientId); // no need to pass clientId if fetchJobs reads it from store
        }

        return true;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete job");
    }
    return false;
  },
  updateJob: async (jobId: string, jobData: Job) => {
    try {
      const res = await api.put(`/jobs/jobupdate/${jobId}`, jobData);
      if (res.data.success) {
        toast.success("Job updated successfully!");
        const clientId = useUserStore.getState().profile?._id;
        get().fetchJobs(clientId);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update job");
    }
  },
}));
