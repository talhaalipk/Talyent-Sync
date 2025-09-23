// src/components/Admin/AdminProfile.tsx
import { Mail, User, Shield, Calendar, CheckCircle } from "lucide-react";

interface AdminProfileProps {
  admin: {
    id: string;
    UserName: string;
    email: string;
    role: "admin" | "super-admin";
    profilePic: string;
    isActive: boolean;
    lastLogin?: string;
  };
}

const AdminProfile = ({ admin }: AdminProfileProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Picture */}
          <div className="relative">
            <img
              src={admin.profilePic}
              alt={admin.UserName}
              className="w-32 h-32 rounded-full border-4 border-[#134848]"
            />
            <div
              className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${
                admin.isActive ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <CheckCircle size={16} className="text-white" />
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-[#134848] mb-2">{admin.UserName}</h1>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  admin.role === "super-admin"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                <Shield size={16} className="mr-1" />
                {admin.role === "super-admin" ? "Super Admin" : "Admin"}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  admin.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {admin.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-gray-600 text-lg">Administrator Dashboard Access</p>
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-[#134848] mb-6 flex items-center gap-2">
            <User size={24} />
            Account Details
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="text-[#134848]" size={20} />
              <div>
                <label className="text-sm font-medium text-gray-500">Username</label>
                <p className="text-lg font-semibold text-[#134848]">{admin.UserName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="text-[#134848]" size={20} />
              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-lg font-semibold text-[#134848]">{admin.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Shield className="text-[#134848]" size={20} />
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="text-lg font-semibold text-[#134848] capitalize">
                  {admin.role.replace("-", " ")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-[#134848] mb-6 flex items-center gap-2">
            <Calendar size={24} />
            Activity Information
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-500 block mb-1">Account Status</label>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    admin.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`font-semibold ${admin.isActive ? "text-green-600" : "text-red-600"}`}
                >
                  {admin.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-500 block mb-1">Last Login</label>
              <p className="text-lg font-semibold text-[#134848]">{formatDate(admin.lastLogin)}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-500 block mb-1">Admin ID</label>
              <p className="text-sm font-mono text-gray-600 break-all">{admin.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
        <h2 className="text-xl font-semibold text-[#134848] mb-6">Permissions & Access</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-green-800 font-medium">User Management</span>
          </div>

          {admin.role === "super-admin" && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-green-800 font-medium">Admin Management</span>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-green-800 font-medium">System Analytics</span>
          </div>

          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-green-800 font-medium">Dispute Management</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
