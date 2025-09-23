// src/ui/Admin/RoleDropdown.tsx
import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

interface RoleDropdownProps {
  role: "admin" | "super-admin";
  onRoleChange: (newRole: "admin" | "super-admin") => void;
  loading?: boolean;
}

const RoleDropdown = ({ role, onRoleChange, loading = false }: RoleDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRoleChange = (newRole: "admin" | "super-admin") => {
    onRoleChange(newRole);
    setIsOpen(false);
  };

  const getRoleDisplay = (role: string) => {
    return role === "super-admin" ? "Super Admin" : "Admin";
  };

  return (
    <div className="relative">
      <button
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          role === "super-admin"
            ? "bg-red-100 text-red-800 hover:bg-red-200"
            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
        } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <>
            {getRoleDisplay(role)}
            <ChevronDown size={14} />
          </>
        )}
      </button>

      {isOpen && !loading && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[120px]">
            <button
              onClick={() => handleRoleChange("admin")}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-blue-600 first:rounded-t-md"
            >
              Admin
            </button>
            <button
              onClick={() => handleRoleChange("super-admin")}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 last:rounded-b-md"
            >
              Super Admin
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RoleDropdown;
