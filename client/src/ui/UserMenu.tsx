import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  User,
  UserRoundPen,
  UserStar,
  Wallet,
  ChartNetwork,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function UserMenu({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative z-50" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
      >
        {user?.profilePic ? (
          <img
            src={user.profilePic}
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#134848] flex items-center justify-center text-white font-medium">
            {user?.UserName ? user.UserName[0].toUpperCase() : <User size={18} />}
          </div>
        )}
        {/* ✅ Username: always visible */}
        <span className="text-sm font-medium text-gray-800">{user?.UserName}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard size={18} />
            <span>Jobs & Proposal</span>
          </Link>

          <Link
            to="/Active-jobs"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            <UserRoundPen size={18} />
            <span>Active Jobs</span>
          </Link>
          <Link
            to="/my-reviews"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            <UserStar size={18} />
            <span> Reviews </span>
          </Link>
          <Link
            to="/my-analytics"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            <ChartNetwork size={18} />
            <span> Analytics </span>
          </Link>
          <Link
            to="/wallet"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            <Wallet size={18} />
            <span> My Wallet </span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            <User size={18} />
            <span>My Profile</span>
          </Link>
          <button
            onClick={() => {
              logout();
              setOpen(false);
              navigate("/");
            }}
            className="flex w-full items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
