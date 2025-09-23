import { create } from "zustand";
import api from "../utils/axiosInstance";
import { useUserStore } from "./userStore"; // 🔹 import user store

type User = {
  _id: string;
  id: string;
  role: "client" | "freelancer" | "admin";
  email?: string;
  UserName?: string;
};

type AuthState = {
  user: User | null;
  isLoggedIn: boolean;

  setUser: (user: User | null) => void;
  setIsLoggedIn: (val: boolean) => void;

  login: (form: { email: string; password: string }) => Promise<any>;
  register: (form: {
    UserName: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<any>;

  // OAuth methods
  googleAuth: (token: string, role: string) => Promise<any>;

  verifylogin: () => Promise<boolean>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,

  setUser: (user) => set({ user }),
  setIsLoggedIn: (val) => set({ isLoggedIn: val }),

  login: async (form) => {
    const res = await api.post("/auth/login", form, { withCredentials: true });
    const ok = await useAuthStore.getState().verifylogin();

    if (ok) {
      // 🔹 fetch profile right after login
      await useUserStore.getState().fetchProfile();
    }
    return res.data;
  },

  register: async (form) => {
    const res = await api.post("/auth/register", form, { withCredentials: true });
    const ok = await useAuthStore.getState().verifylogin();

    if (ok) {
      // 🔹 fetch profile right after register
      await useUserStore.getState().fetchProfile();
    }
    return res.data;
  },

  verifylogin: async () => {
    try {
      const res = await api.get("/auth/verify", { withCredentials: true });
      if (res.data?.user) {
        set({ user: res.data.user, isLoggedIn: true });
        return true;
      } else {
        set({ user: null, isLoggedIn: false });
        return false;
      }
    } catch (err) {
      console.error("Verify login failed:", err);
      set({ user: null, isLoggedIn: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      set({ user: null, isLoggedIn: false });
      // 🔹 clear user profile also
      useUserStore.getState().clearProfile();
    }
  },

  googleAuth: async (token: string, role: string) => {
    const res = await api.post("/auth/google", { token, role }, { withCredentials: true });
    const ok = await useAuthStore.getState().verifylogin();

    if (ok) {
      await useUserStore.getState().fetchProfile();
    }
    return res.data;
  },
}));
