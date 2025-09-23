// src/store/useFindjob.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "../utils/axiosInstance";

// Types
export interface Job {
  _id: string;
  clientId: {
    _id: string;
    name?: string;
    UserName: string;
    email: string;
    profilePic?: string;
    clientProfile: {
      companyName?: string;
      location?: string;
      clientRating?: number;
    };
  };
  title: string;
  description: string;
  category: string;
  subcategory: string;
  jobType: "fixed" | "hourly";
  budget: {
    jobType: "fixed" | "hourly";
    amount?: number;
    currency: string;
    hourlyRate?: {
      min: number;
      max: number;
    };
  };
  duration: {
    estimate: string;
    startDate: string;
    endDate: string;
  };
  skillsRequired: string[];
  experienceLevel: "entry" | "intermediate" | "expert";
  attachments: string[];
  status: string;
  visibility: string;
  proposalCount: number;
  interviewCount: number;
  hiredCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalJobs: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export interface Filters {
  categories: string[];
  jobTypes: string[];
  experienceLevels: string[];
}

export interface FindJobState {
  // Data
  jobs: Job[];
  pagination: Pagination | null;
  filters: Filters | null;

  // Loading & Error states
  loading: boolean;
  error: string | null;

  // Filter states
  search: string;
  category: string | null;
  subcategory: string | null;
  jobType: "fixed" | "hourly" | null;
  experienceLevel: "entry" | "intermediate" | "expert" | null;
  budgetMin: number | null;
  budgetMax: number | null;

  // Pagination states
  currentPage: number;
  limit: number;

  // Sort states
  sortBy: string;
  sortOrder: "asc" | "desc";

  // Actions
  setSearch: (search: string) => void;
  setCategory: (category: string | null) => void;
  setSubcategory: (subcategory: string | null) => void;
  setJobType: (jobType: "fixed" | "hourly" | null) => void;
  setExperienceLevel: (level: "entry" | "intermediate" | "expert" | null) => void;
  setBudgetMin: (min: number | null) => void;
  setBudgetMax: (max: number | null) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (order: "asc" | "desc") => void;

  // API actions
  searchJobs: () => Promise<void>;
  resetFilters: () => void;
  clearError: () => void;
}

const initialState = {
  jobs: [],
  pagination: null,
  filters: null,
  loading: false,
  error: null,
  search: "",
  category: null,
  subcategory: null,
  jobType: null,
  experienceLevel: null,
  budgetMin: null,
  budgetMax: null,
  currentPage: 1,
  limit: 4,
  sortBy: "createdAt",
  sortOrder: "desc" as const,
};

export const useFindJobStore = create<FindJobState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Filter setters with auto-search
      setSearch: (search: string) => {
        set({ search, currentPage: 1 }, false, "setSearch");
        // Debounce search
        const timeoutId = setTimeout(() => {
          get().searchJobs();
        }, 300);
        // Clear previous timeout
        if ((window as any).searchTimeout) {
          clearTimeout((window as any).searchTimeout);
        }
        (window as any).searchTimeout = timeoutId;
      },

      setCategory: (category: string | null) => {
        set(
          {
            category,
            subcategory: null, // Reset subcategory when category changes
            currentPage: 1,
          },
          false,
          "setCategory"
        );
        get().searchJobs();
      },

      setSubcategory: (subcategory: string | null) => {
        set({ subcategory, currentPage: 1 }, false, "setSubcategory");
        get().searchJobs();
      },

      setJobType: (jobType: "fixed" | "hourly" | null) => {
        set({ jobType, currentPage: 1 }, false, "setJobType");
        get().searchJobs();
      },

      setExperienceLevel: (experienceLevel: "entry" | "intermediate" | "expert" | null) => {
        set({ experienceLevel, currentPage: 1 }, false, "setExperienceLevel");
        get().searchJobs();
      },

      setBudgetMin: (budgetMin: number | null) => {
        set({ budgetMin, currentPage: 1 }, false, "setBudgetMin");
        get().searchJobs();
      },

      setBudgetMax: (budgetMax: number | null) => {
        set({ budgetMax, currentPage: 1 }, false, "setBudgetMax");
        get().searchJobs();
      },

      setPage: (page: number) => {
        set({ currentPage: page }, false, "setPage");
        get().searchJobs();
      },

      setLimit: (limit: number) => {
        set({ limit, currentPage: 1 }, false, "setLimit");
        get().searchJobs();
      },

      setSortBy: (sortBy: string) => {
        set({ sortBy, currentPage: 1 }, false, "setSortBy");
        get().searchJobs();
      },

      setSortOrder: (sortOrder: "asc" | "desc") => {
        set({ sortOrder, currentPage: 1 }, false, "setSortOrder");
        get().searchJobs();
      },

      // API call function
      searchJobs: async () => {
        const state = get();
        set({ loading: true, error: null }, false, "searchJobs:start");

        try {
          // Build query parameters
          const params = new URLSearchParams();

          if (state.search) params.append("search", state.search);
          if (state.category) params.append("category", state.category);
          if (state.jobType) params.append("jobType", state.jobType);
          if (state.experienceLevel) params.append("experienceLevel", state.experienceLevel);
          if (state.budgetMin !== null) params.append("minBudget", state.budgetMin.toString());
          if (state.budgetMax !== null) params.append("maxBudget", state.budgetMax.toString());

          params.append("page", state.currentPage.toString());
          params.append("limit", state.limit.toString());
          params.append("sortBy", state.sortBy);
          params.append("sortOrder", state.sortOrder);

          const response = await api.get(`/jobs/public/jobs?${params.toString()}`);

          if (response.data.success) {
            set(
              {
                jobs: response.data.data.jobs,
                pagination: response.data.data.pagination,
                filters: response.data.data.filters,
                loading: false,
                error: null,
              },
              false,
              "searchJobs:success"
            );
          } else {
            set(
              {
                loading: false,
                error: response.data.message || "Failed to fetch jobs",
              },
              false,
              "searchJobs:error"
            );
          }
        } catch (error: any) {
          console.error("Job search error:", error);
          set(
            {
              loading: false,
              error: error.response?.data?.message || "Failed to fetch jobs",
            },
            false,
            "searchJobs:error"
          );
        }
      },

      // Reset filters
      resetFilters: () => {
        set(
          {
            search: "",
            category: null,
            subcategory: null,
            jobType: null,
            experienceLevel: null,
            budgetMin: null,
            budgetMax: null,
            currentPage: 1,
            sortBy: "createdAt",
            sortOrder: "desc",
          },
          false,
          "resetFilters"
        );
        get().searchJobs();
      },

      // Clear error
      clearError: () => {
        set({ error: null }, false, "clearError");
      },
    }),
    {
      name: "find-job-store", // Store name for devtools
    }
  )
);

// Selector hooks for better performance
export const useJobs = () => useFindJobStore((state) => state.jobs);
export const usePagination = () => useFindJobStore((state) => state.pagination);
export const useLoading = () => useFindJobStore((state) => state.loading);
export const useError = () => useFindJobStore((state) => state.error);
export const useFilters = () =>
  useFindJobStore((state) => ({
    search: state.search,
    category: state.category,
    subcategory: state.subcategory,
    jobType: state.jobType,
    experienceLevel: state.experienceLevel,
    budgetMin: state.budgetMin,
    budgetMax: state.budgetMax,
  }));

// Auto-initialize store (fetch jobs on first load)
setTimeout(() => {
  useFindJobStore.getState().searchJobs();
}, 0);
