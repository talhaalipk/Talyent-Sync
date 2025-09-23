// src/components/Admin/AdminSidebar.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { Users, Shield, AlertTriangle, BarChart3, LogOut, User } from "lucide-react";
import { useAdminAuthStore } from "../../store/Admin/adminAuthStore";

interface AdminSidebarProps {
  admin: {
    id: string;
    UserName: string;
    email: string;
    role: "admin" | "super-admin";
    profilePic: string;
    isActive: boolean;
  };
}

const AdminSidebar = ({ admin }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAdminAuthStore();

  const menuItems = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/admin/dashboard/profile",
      onClick: () => navigate("/admin/dashboard/profile"),
    },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      path: "/admin/dashboard/user-management",
      onClick: () => navigate("/admin/dashboard/user-management"),
    },
    {
      id: "admins",
      label: "Admin Management",
      icon: Shield,
      path: "/admin/dashboard/admin-management",
      onClick: () => navigate("/admin/dashboard/admin-management"),
    },
    {
      id: "disputes",
      label: "Dispute Management",
      icon: AlertTriangle,
      path: "/admin/dashboard/dispute-management",
      onClick: () => navigate("/admin/dashboard/dispute-management"),
    },
    {
      id: "analytics",
      label: "System Analysis",
      icon: BarChart3,
      path: "/admin/dashboard/system-analysis",
      onClick: () => navigate("/admin/dashboard/system-analysis"),
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path ||
      (path === "/admin/dashboard/profile" && location.pathname === "/admin/dashboard")
    );
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Admin Profile Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col items-center">
          <img
            src={admin.profilePic}
            alt={admin.UserName}
            className="w-16 h-16 rounded-full border-4 border-[#134848] mb-3"
          />
          <h3 className="font-semibold text-[#134848] truncate w-full text-center">
            {admin.UserName}
          </h3>
          <p className="text-sm text-gray-500 capitalize">{admin.role}</p>
          <div
            className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${
              admin.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {admin.isActive ? "Active" : "Inactive"}
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                    isActive(item.path)
                      ? "bg-[#134848] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <IconComponent size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
