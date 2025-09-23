import { create } from "zustand";
import api from "../utils/axiosInstance";

type UserRole = "client" | "freelancer";

type UpdateResponse = {
  success: boolean;
  message: string;
};

export interface User {
  _id: string;
  name?: string;
  UserName: string;
  email: string;
  profilePic: string;
  role: UserRole;
  clientProfile?: {
    companyName?: string;
    budget?: number;
    location?: string;
    companyDescription?: string;
  };
  freelancerProfile?: {
    bio_desc?: string;
    skills?: string[];
    hourlyRate?: number;
    portfolio?: { title: string; url: string }[];
    certifications?: { title: string; issuer: string; year: string }[];
    location?: string;
  };
}
type UserState = {
  profile: User | null;
  loading: boolean;
  error: string | null;
  uploadingImage: boolean;

  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<boolean>;
  updateClientProfile: (data: Partial<User["clientProfile"]>) => Promise<UpdateResponse>; // 👈 fix here
  clearProfile: () => void; // 🔹 new helper for logout
};

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  loading: false,
  error: null,
  uploadingImage: false,

  fetchProfile: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/profile", { withCredentials: true });
      set({ profile: res.data, loading: false });
    } catch (err: any) {
      console.error("Fetch profile error:", err);
      set({ error: err.message, loading: false, profile: null });
    }
  },

  updateProfile: async (data) => {
    set({ loading: true });
    try {
      const res = await api.put("/profile", data, { withCredentials: true });
      set({ profile: res.data, loading: false });
      await get().fetchProfile();
    } catch (err: any) {
      console.error("Update profile error:", err);
      set({ error: err.message, loading: false });
    }
  },

  uploadProfileImage: async (file: File) => {
    set({ uploadingImage: true, error: null });

    try {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

      if (file.size > maxSize) {
        set({ error: "File size must be less than 5MB", uploadingImage: false });
        return false;
      }

      if (!allowedTypes.includes(file.type)) {
        set({
          error: "Only JPG, JPEG, PNG, and GIF files are allowed",
          uploadingImage: false,
        });
        return false;
      }

      const formData = new FormData();
      formData.append("profilePic", file);

      const response = await api.post("/profile/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response.data.success) {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: {
              ...currentProfile,
              profilePic: response.data.data.profilePic,
            },
            uploadingImage: false,
          });
        }
        return true;
      } else {
        set({
          error: response.data.message || "Upload failed",
          uploadingImage: false,
        });
        return false;
      }
    } catch (err: any) {
      console.error("Image upload error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Image upload failed";
      set({ error: errorMessage, uploadingImage: false });
      return false;
    }
  },

  updateClientProfile: async (data: Partial<User["clientProfile"]>) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put("/profile/client", data, { withCredentials: true });

      if (res.data.success) {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: {
              ...currentProfile,
              clientProfile: {
                ...currentProfile.clientProfile,
                ...res.data.data.clientProfile,
              },
            },
            loading: false,
          });
        } else {
          set({ profile: res.data.data, loading: false });
        }

        return { success: true, message: res.data.message };
      } else {
        set({ error: res.data.message || "Update failed", loading: false });
        return { success: false, message: res.data.message || "Update failed" };
      }
    } catch (err: any) {
      console.error("Update client profile error:", err);
      const errorMessage = err.response?.data?.message || err.message;
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  clearProfile: () => {
    set({ profile: null, error: null, loading: false, uploadingImage: false });
  },
}));
