// src/pages/Admin/AdminDashboard.tsx (Updated with Dispute Management)
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
import { useAdminAuthStore } from "../../store/Admin/adminAuthStore";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminProfile from "../../components/Admin/AdminProfile";
import UserManagement from "../../components/Admin/UserManagement";
import AdminManagement from "../../components/Admin/AdminManagement";
import SystemAnalysis from "../../components/Admin/SystemAnalysis";
import DisputeManagement from "../../components/Admin/DisputeManagement";
import DisputeDetails from "../../components/Admin/Dispute/DisputeDetails";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, isLoggedIn, verifyAuth } = useAdminAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await verifyAuth();
        if (!isAuthenticated) {
          navigate("/admin/login");
          return;
        }
      } catch (error) {
        console.log(error);
        navigate("/admin/login");
        return;
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [verifyAuth, navigate]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("profile")) return "Admin Profile";
    if (path.includes("user-management")) return "User Management";
    if (path.includes("admin-management")) return "Admin Management";
    if (path.includes("dispute-management")) {
      if (path.includes("/dispute-management/") && path.split("/").length > 4) {
        return "Dispute Resolution";
      }
      return "Dispute Management";
    }
    if (path.includes("system-analysis")) return "System Analysis";
    return "Admin Profile";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#134848] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !admin) {
    return null; // Will redirect to login
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Left Sidebar - Fixed */}
      <AdminSidebar admin={admin} />

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Header - Fixed */}
        <header className="bg-white shadow-sm border-b px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#134848]">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">{getPageTitle()}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-[#134848]">{admin.UserName}</p>
                <p className="text-xs text-gray-500 capitalize">{admin.role.replace("-", " ")}</p>
              </div>
              <img
                src={admin.profilePic}
                alt={admin.UserName}
                className="w-10 h-10 rounded-full border-2 border-[#134848] object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.UserName)}&background=134848&color=fff`;
                }}
              />
            </div>
          </div>
        </header>

        {/* Main Content with Routes - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Routes>
              {/* Default route redirects to profile */}
              <Route path="/" element={<Navigate to="profile" replace />} />

              {/* Profile Route */}
              <Route path="profile" element={<AdminProfile admin={admin} />} />

              {/* User Management Route */}
              <Route path="user-management" element={<UserManagement />} />

              {/* Admin Management Route */}
              <Route path="admin-management" element={<AdminManagement />} />

              {/* Dispute Management Routes */}
              <Route path="dispute-management" element={<DisputeManagement />} />
              <Route path="dispute-management/:contractId" element={<DisputeDetails />} />

              {/* System Analysis Route */}
              <Route path="system-analysis" element={<SystemAnalysis />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
