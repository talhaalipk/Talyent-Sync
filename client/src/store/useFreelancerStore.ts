import { create } from "zustand";
import api from "../utils/axiosInstance"; // ✅ your axios setup

export interface Freelancer {
  _id: string;
  name: string;
  UserName: string;
  profilePic: string;
  freelancerProfile: {
    bio_desc: string;
    location: string;
    skills: string[];
    hourlyRate: number;
    successRate: number;
    ratingAvg: number;
    ratingCount: number;
  };
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

interface Filters {
  minRating?: number;
  minRatingCount?: number;
  minSuccessRate?: number;
  location?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface FreelancerStore {
  freelancers: Freelancer[];
  pagination: Pagination | null;
  filters: Filters;
  loading: boolean;
  fetchFreelancers: (page?: number, limit?: number) => Promise<void>;
  setFilters: (filters: Partial<Filters>) => void;
}

export const useFreelancerStore = create<FreelancerStore>((set, get) => ({
  freelancers: [],
  pagination: null,
  filters: {
    minRating: undefined,
    minSuccessRate: undefined,
    location: "",
    sortBy: "ratingAvg",
    sortOrder: "desc",
  },
  loading: false,

  fetchFreelancers: async (page = 1, limit = 10) => {
    try {
      set({ loading: true });
      const { filters } = get();
      const response = await api.get("/freelacer", {
        params: {
          page,
          limit,
          ratingAvg: filters.minRating,
          ratingCount: filters.minRatingCount,
          successRate: filters.minSuccessRate,
          location: filters.location,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        },
      });

      set({
        freelancers: response.data.data.freelancers,
        pagination: response.data.data.pagination,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching freelancers:", error);
      set({ loading: false });
    }
  },

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
}));
