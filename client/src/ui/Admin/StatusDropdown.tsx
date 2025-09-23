// src/ui/Admin/StatusDropdown.tsx
import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

interface StatusDropdownProps {
  isActive: boolean;
  onStatusChange: (newStatus: boolean) => void;
  loading?: boolean;
}

const StatusDropdown = ({ isActive, onStatusChange, loading = false }: StatusDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = (newStatus: boolean) => {
    onStatusChange(newStatus);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          isActive
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-red-100 text-red-800 hover:bg-red-200"
        } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <>
            {isActive ? "Active" : "Inactive"}
            <ChevronDown size={14} />
          </>
        )}
      </button>

      {isOpen && !loading && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[100px]">
            <button
              onClick={() => handleStatusChange(true)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-green-600 first:rounded-t-md"
            >
              Active
            </button>
            <button
              onClick={() => handleStatusChange(false)}
              className="w-full px-4 py-2 text-left text-sm  bg-white border border-gray-200 hover:bg-gray-50 text-red-600 last:rounded-b-md"
            >
              In-Active
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StatusDropdown;
