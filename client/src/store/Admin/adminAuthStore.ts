// src/store/Admin/adminAuthStore.ts
import { create } from "zustand";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";

type AdminUser = {
  id: string;
  UserName: string;
  email: string;
  role: "admin" | "super-admin";
  profilePic: string;
  isActive: boolean;
  lastLogin?: string;
};

type AdminAuthState = {
  admin: AdminUser | null;
  isLoggedIn: boolean;
  loading: boolean;

  setAdmin: (admin: AdminUser | null) => void;
  setIsLoggedIn: (val: boolean) => void;
  setLoading: (loading: boolean) => void;

  register: (form: {
    UserName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<boolean>;

  login: (form: { email: string; password: string }) => Promise<boolean>;

  verifyAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
};

// Create a separate axios instance for admin API calls
const adminApi = api.create({
  baseURL: `${import.meta.env.VITE_BACKED_BASE_URL_API}/admin`,
  withCredentials: true,
});

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: null,
  isLoggedIn: false,
  loading: false,

  setAdmin: (admin) => set({ admin }),
  setIsLoggedIn: (val) => set({ isLoggedIn: val }),
  setLoading: (loading) => set({ loading }),

  register: async (form) => {
    try {
      set({ loading: true });

      const response = await adminApi.post("/auth/register", form);

      if (response.data.success) {
        set({
          admin: response.data.admin,
          isLoggedIn: true,
          loading: false,
        });

        toast.success("Admin account created successfully!");
        return true;
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error: any) {
      set({ loading: false });
      const errorMessage = error.response?.data?.message || error.message || "Registration failed";
      toast.error(errorMessage);
      return false;
    }
  },

  login: async (form) => {
    try {
      set({ loading: true });

      const response = await adminApi.post("/auth/login", form);

      if (response.data.success) {
        set({
          admin: response.data.admin,
          isLoggedIn: true,
          loading: false,
        });

        toast.success("Login successful!");
        return true;
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: any) {
      set({ loading: false });
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
      return false;
    }
  },

  verifyAuth: async () => {
    try {
      const response = await adminApi.get("/auth/verify");

      if (response.data.success) {
        set({
          admin: response.data.admin,
          isLoggedIn: true,
        });
        return true;
      } else {
        set({
          admin: null,
          isLoggedIn: false,
        });
        return false;
      }
    } catch (error: any) {
      console.error("Admin auth verification failed:", error);
      set({
        admin: null,
        isLoggedIn: false,
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await adminApi.post("/auth/logout");
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    } finally {
      set({
        admin: null,
        isLoggedIn: false,
      });
    }
  },
}));
