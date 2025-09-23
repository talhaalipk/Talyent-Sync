// src/store/reviewStore.ts
import { create } from "zustand";
import api from "../utils/axiosInstance";
import toast from "react-hot-toast";

// Types
export interface Review {
  _id: string;
  contractId: string;
  jobId: {
    _id: string;
    title: string;
    category: string;
  };
  reviewerId: {
    _id: string;
    name: string;
    UserName: string;
    profilePic: string;
  };
  revieweeId: {
    _id: string;
    name: string;
    UserName: string;
    profilePic: string;
  };
  reviewerRole: "client" | "freelancer";
  revieweeRole: "client" | "freelancer";
  rating: number;
  comment: string;
  reviewType: "client_to_freelancer" | "freelancer_to_client";
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

export interface MyReviewsData {
  reviewsReceived: Review[];
  reviewsGiven: Review[];
  stats: ReviewStats;
}

export interface CreateReviewData {
  rating: number;
  comment: string;
}

type ReviewStore = {
  myReviews: MyReviewsData | null;
  jobReviews: Review[];
  loading: boolean;
  error: string | null;

  // Actions
  createReview: (contractId: string, data: CreateReviewData) => Promise<boolean>;
  fetchMyReviews: () => Promise<void>;
  fetchJobReviews: (jobId: string) => Promise<void>;
  checkReviewEligibility: (
    contractId: string
  ) => Promise<{ canReview: boolean; message: string; existingReview?: boolean }>;

  // Utility functions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearReviews: () => void;
};

export const useReviewStore = create<ReviewStore>((set, get) => ({
  myReviews: null,
  jobReviews: [],
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearReviews: () => set({ myReviews: null, jobReviews: [], error: null }),

  createReview: async (contractId: string, data: CreateReviewData) => {
    let loadingToast;
    try {
      set({ loading: true, error: null });
      loadingToast = toast.loading("Submitting review...");

      const response = await api.post(`/reviews/contract/${contractId}`, data);

      toast.dismiss(loadingToast);
      if (response.data.success) {
        set({ loading: false });
        toast.success("Review submitted successfully!");
        await get().fetchMyReviews(); // Refresh my reviews
        return true;
      } else {
        throw new Error(response.data.message || "Failed to create review");
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to create review";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error(errorMessage);
      return false;
    }
  },

  fetchMyReviews: async () => {
    let loadingToast;
    try {
      set({ loading: true, error: null });
      loadingToast = toast.loading("Fetching my reviews...");

      const response = await api.get("/reviews/my-reviews");

      toast.dismiss(loadingToast);
      if (response.data.success) {
        set({
          myReviews: response.data.data,
          loading: false,
        });
        toast.success("My reviews loaded!");
      } else {
        throw new Error(response.data.message || "Failed to fetch reviews");
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to fetch reviews";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error(errorMessage);
    }
  },

  fetchJobReviews: async (jobId: string) => {
    let loadingToast;
    try {
      set({ loading: true, error: null });
      loadingToast = toast.loading("Fetching job reviews...");

      const response = await api.get(`/reviews/job/${jobId}`);

      toast.dismiss(loadingToast);
      if (response.data.success) {
        set({
          jobReviews: response.data.reviews,
          loading: false,
        });
        toast.success("Job reviews loaded!");
      } else {
        throw new Error(response.data.message || "Failed to fetch job reviews");
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to fetch job reviews";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error(errorMessage);
      console.error("Error fetching job reviews:", errorMessage);
    }
  },

  checkReviewEligibility: async (contractId: string) => {
    try {
      const response = await api.get(`/reviews/contract/${contractId}/eligibility`);
      return {
        canReview: response.data.canReview,
        message: response.data.message,
        existingReview: response.data.existingReview,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to check eligibility";
      console.error("Error checking review eligibility:", errorMessage);
      return {
        canReview: false,
        message: errorMessage,
      };
    }
  },
}));
