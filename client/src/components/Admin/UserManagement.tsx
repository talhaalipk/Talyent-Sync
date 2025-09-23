// src/components/Admin/UserManagement.tsx
import { useEffect } from "react";
import { Users, Filter, CircleUser, UserPen } from "lucide-react";
import { useAdminDashboardStore } from "../../store/Admin/adminDashboardStore";
import UserTable from "./UserTable";
import FilterButtons from "./FilterButtons";

const UserManagement = () => {
  const { users, usersLoading, usersFilter, setUsersFilter, fetchUsers } = useAdminDashboardStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filterOptions = [
    { value: "all", label: "All Users", count: users.length },
    {
      value: "active",
      label: "Active",
      count: users.filter((u) => u.isActive).length,
    },
    {
      value: "inactive",
      label: "Not Active",
      count: users.filter((u) => !u.isActive).length,
    },
  ];

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#134848] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#2E90EB] bg-opacity-10 rounded-lg flex items-center justify-center">
            <Users className="text-[#2E90EB]" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#134848]">User Management</h1>
            <p className="text-gray-600">Manage all platform users (freelancers and clients)</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-[#134848]">{users.length}</p>
            </div>
            <Users className="text-[#2E90EB]" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-3xl font-bold text-[#10B981]">
                {users.filter((u) => u.isActive).length}
              </p>
            </div>
            <div className="w-6 h-6 bg-[#10B981] rounded-full"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Freelancers</p>
              <p className="text-3xl font-bold text-[#F59E0B]">
                {users.filter((u) => u.role === "freelancer").length}
              </p>
            </div>
            <CircleUser className="text-[#F59E0B]" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Clients</p>
              <p className="text-3xl font-bold text-[#EF4444]">
                {users.filter((u) => u.role === "client").length}
              </p>
            </div>
            <UserPen className="text-[#EF4444]" size={24} />
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
              <h3 className="font-semibold text-[#134848]">Filter Users</h3>
            </div>

            <FilterButtons
              options={filterOptions}
              activeFilter={usersFilter}
              onFilterChange={setUsersFilter}
            />
          </div>
        </div>

        {/* Users Table */}
        <UserTable users={users} />
      </div>
    </div>
  );
};

export default UserManagement;
