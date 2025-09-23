// src/components/Admin/AdminTable.tsx
import { useState } from "react";
import { Calendar, Shield } from "lucide-react";
import { useAdminDashboardStore } from "../../store/Admin/adminDashboardStore";
import type { DashboardAdmin } from "../../store/Admin/adminDashboardStore";
import StatusDropdown from "../../ui/Admin/StatusDropdown";
import RoleDropdown from "../../ui/Admin/RoleDropdown";

interface AdminTableProps {
  admins: DashboardAdmin[];
  currentAdminRole: string;
  currentAdminId: string;
}

const AdminTable = ({ admins, currentAdminRole, currentAdminId }: AdminTableProps) => {
  const { toggleAdminStatus, changeAdminRole } = useAdminDashboardStore();
  const [updatingAdmins, setUpdatingAdmins] = useState<Set<string>>(new Set());

  const handleStatusChange = async (adminId: string, newStatus: boolean) => {
    setUpdatingAdmins((prev) => new Set([...prev, adminId]));
    try {
      await toggleAdminStatus(adminId, newStatus);
    } catch (error) {
      console.error("Failed to update admin status:", error);
    } finally {
      setUpdatingAdmins((prev) => {
        const newSet = new Set(prev);
        newSet.delete(adminId);
        return newSet;
      });
    }
  };

  const handleRoleChange = async (adminId: string, newRole: "admin" | "super-admin") => {
    setUpdatingAdmins((prev) => new Set([...prev, adminId]));
    try {
      await changeAdminRole(adminId, newRole);
    } catch (error) {
      console.error("Failed to update admin role:", error);
    } finally {
      setUpdatingAdmins((prev) => {
        const newSet = new Set(prev);
        newSet.delete(adminId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const canEdit = currentAdminRole === "super-admin";
  const isSelf = (adminId: string) => adminId === currentAdminId;

  if (admins.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No admins found</h3>
        <p className="text-gray-500">No admins match your current filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Admin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Admin Since
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {admins.map((admin) => (
            <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={admin.profilePic}
                      alt={admin.UserName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.UserName)}&background=134848&color=fff`;
                      }}
                    />
                    {isSelf(admin._id) && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#134848] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">●</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900">{admin.UserName}</div>
                      {isSelf(admin._id) && (
                        <span className="text-xs bg-[#134848] text-white px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{admin.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {canEdit && !isSelf(admin._id) ? (
                  <RoleDropdown
                    role={admin.role}
                    onRoleChange={(newRole) => handleRoleChange(admin._id, newRole)}
                    loading={updatingAdmins.has(admin._id)}
                  />
                ) : (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.role === "super-admin"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {admin.role === "super-admin" ? "Super Admin" : "Admin"}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {canEdit && !isSelf(admin._id) ? (
                  <StatusDropdown
                    isActive={admin.isActive}
                    onStatusChange={(newStatus) => handleStatusChange(admin._id, newStatus)}
                    loading={updatingAdmins.has(admin._id)}
                  />
                ) : (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {admin.isActive ? "Active" : "Inactive"}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  {formatDate(admin.createdAt)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
