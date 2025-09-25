// src/pages/Dashboard.tsx
import { useUserStore } from "../store/userStore";
import ClientDashboard from "../components/dashboard/ClientDashBorad";
import FreelancerDashboard from "../components/dashboard/FreelancerDashBorad";
import PleaseLogin from "../components/PleaseLogin";
import { useEffect } from "react";

export default function Dashboard() {
  const { profile, fetchProfile, loading } = useUserStore();

  useEffect(() => {
    if (!profile) fetchProfile();
  }, [profile, fetchProfile]);

  useEffect(() => {
    console.log(profile);
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (!profile) {
    return <PleaseLogin />; // 🔹 render component instead of plain text
  }

  return (
    <div className="min-h-screen  p-6 sm:mx-10">
      <div className="max-w-7xl mx-auto">
        {" "}
        <h1 className="text-3xl font-bold text-[#134848] mb-2">Jobs & Proposals</h1>
        {profile.role === "client" ? <ClientDashboard /> : <FreelancerDashboard />}
      </div>
    </div>
  );
}
