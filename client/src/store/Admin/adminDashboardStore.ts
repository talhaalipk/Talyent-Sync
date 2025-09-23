// src/store/Admin/adminDashboardStore.ts
import { create } from "zustand";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";

export interface DashboardUser {
  _id: string;
  UserName: string;
  email: string;
  role: "client" | "freelancer";
  profilePic: string;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardAdmin {
  _id: string;
  UserName: string;
  email: string;
  role: "admin" | "super-admin";
  profilePic: string;
  isActive: boolean;
  createdAt: string;
  adminProfile?: {
    lastLogin?: string;
    department?: string;
  };
}

type AdminDashboardStore = {
  // Users management
  users: DashboardUser[];
  usersLoading: boolean;
  usersFilter: "all" | "active" | "inactive";

  // Admins management
  admins: DashboardAdmin[];
  adminsLoading: boolean;
  adminsFilter: "all" | "active" | "inactive";

  // General
  error: string | null;

  // Actions
  fetchUsers: () => Promise<void>;
  toggleUserStatus: (userId: string, isActive: boolean) => Promise<void>;
  setUsersFilter: (filter: "all" | "active" | "inactive") => void;

  fetchAdmins: () => Promise<void>;
  toggleAdminStatus: (adminId: string, isActive: boolean) => Promise<void>;
  changeAdminRole: (adminId: string, role: "admin" | "super-admin") => Promise<void>;
  setAdminsFilter: (filter: "all" | "active" | "inactive") => void;

  clearError: () => void;
};

// Create admin API instance
const adminApi = api.create({
  baseURL: `${import.meta.env.VITE_BACKED_BASE_URL_API}/admin`,
  withCredentials: true,
});

export const useAdminDashboardStore = create<AdminDashboardStore>((set, get) => ({
  // Initial state
  users: [],
  usersLoading: false,
  usersFilter: "all",
  admins: [],
  adminsLoading: false,
  adminsFilter: "all",
  error: null,

  // Users Management Actions
  fetchUsers: async () => {
    try {
      set({ usersLoading: true, error: null });

      const { usersFilter } = get();
      const response = await adminApi.get(`/dashboard/users?filter=${usersFilter}`);

      if (response.data.success) {
        set({
          users: response.data.users,
          usersLoading: false,
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch users");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to fetch users";
      set({
        error: errorMessage,
        usersLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  toggleUserStatus: async (userId: string, isActive: boolean) => {
    try {
      const response = await adminApi.patch(`/dashboard/users/${userId}/status`, { isActive });

      if (response.data.success) {
        // Update user in local state
        set((state) => ({
          users: state.users.map((user) => (user._id === userId ? { ...user, isActive } : user)),
        }));

        toast.success(`User ${isActive ? "activated" : "deactivated"} successfully`);
      } else {
        throw new Error(response.data.message || "Failed to update user status");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to update user status";
      toast.error(errorMessage);
      throw error;
    }
  },

  setUsersFilter: (filter) => {
    set({ usersFilter: filter });
    get().fetchUsers();
  },

  // Admins Management Actions
  fetchAdmins: async () => {
    try {
      set({ adminsLoading: true, error: null });

      const { adminsFilter } = get();
      const response = await adminApi.get(`/dashboard/admins?filter=${adminsFilter}`);

      if (response.data.success) {
        set({
          admins: response.data.admins,
          adminsLoading: false,
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch admins");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to fetch admins";
      set({
        error: errorMessage,
        adminsLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  toggleAdminStatus: async (adminId: string, isActive: boolean) => {
    try {
      const response = await adminApi.patch(`/dashboard/admins/${adminId}/status`, { isActive });

      if (response.data.success) {
        // Update admin in local state
        set((state) => ({
          admins: state.admins.map((admin) =>
            admin._id === adminId ? { ...admin, isActive } : admin
          ),
        }));

        toast.success(`Admin ${isActive ? "activated" : "deactivated"} successfully`);
      } else {
        throw new Error(response.data.message || "Failed to update admin status");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to update admin status";
      toast.error(errorMessage);
      throw error;
    }
  },

  changeAdminRole: async (adminId: string, role: "admin" | "super-admin") => {
    try {
      const response = await adminApi.patch(`/dashboard/admins/${adminId}/role`, { role });

      if (response.data.success) {
        // Update admin in local state
        set((state) => ({
          admins: state.admins.map((admin) => (admin._id === adminId ? { ...admin, role } : admin)),
        }));

        toast.success(`Admin role changed to ${role} successfully`);
      } else {
        throw new Error(response.data.message || "Failed to change admin role");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to change admin role";
      toast.error(errorMessage);
      throw error;
    }
  },

  setAdminsFilter: (filter) => {
    set({ adminsFilter: filter });
    get().fetchAdmins();
  },

  clearError: () => set({ error: null }),
}));
