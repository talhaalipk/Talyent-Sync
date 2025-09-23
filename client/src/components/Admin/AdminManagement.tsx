// src/components/Admin/AdminManagement.tsx
import { useEffect } from "react";
import { Shield, Filter } from "lucide-react";
import { useAdminDashboardStore } from "../../store/Admin/adminDashboardStore";
import { useAdminAuthStore } from "../../store/Admin/adminAuthStore";
import AdminTable from "./AdminTable";
import FilterButtons from "./FilterButtons";

const AdminManagement = () => {
  const { admin } = useAdminAuthStore();
  const { admins, adminsLoading, adminsFilter, setAdminsFilter, fetchAdmins } =
    useAdminDashboardStore();

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const filterOptions = [
    { value: "all", label: "All Admins", count: admins.length },
    {
      value: "active",
      label: "Active",
      count: admins.filter((a) => a.isActive).length,
    },
    {
      value: "inactive",
      label: "Not Active",
      count: admins.filter((a) => !a.isActive).length,
    },
  ];

  if (adminsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#134848] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#EF4444] bg-opacity-10 rounded-lg flex items-center justify-center">
            <Shield className="text-[#EF4444]" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#134848]">Admin Management</h1>
            <p className="text-gray-600">Manage admin users and permissions</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Admins</p>
              <p className="text-3xl font-bold text-[#134848]">{admins.length}</p>
            </div>
            <Shield className="text-[#2E90EB]" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Super Admins</p>
              <p className="text-3xl font-bold text-[#EF4444]">
                {admins.filter((a) => a.role === "super-admin").length}
              </p>
            </div>
            <div className="w-6 h-6 bg-[#EF4444] rounded-full"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Regular Admins</p>
              <p className="text-3xl font-bold text-[#10B981]">
                {admins.filter((a) => a.role === "admin").length}
              </p>
            </div>
            <div className="w-6 h-6 bg-[#10B981] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Filter Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <h3 className="font-semibold text-[#134848]">Filter Admins</h3>
            </div>

            <FilterButtons
              options={filterOptions}
              activeFilter={adminsFilter}
              onFilterChange={setAdminsFilter}
            />
          </div>
        </div>

        {/* Admins Table */}
        <AdminTable
          admins={admins}
          currentAdminRole={admin?.role || "admin"}
          currentAdminId={admin?.id || ""}
        />
      </div>
    </div>
  );
};

export default AdminManagement;
