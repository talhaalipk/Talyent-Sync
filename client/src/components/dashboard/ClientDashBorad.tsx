// src/components/dashboard/ClientDashBorad.tsx
import { useState } from "react";
import JobsSection from "./client/JobsSection";
import ReceivedProposals from "./client/ReceivedProposals";
// import WelcomeAndProfile from "./client/WelcomeAndProfile";

function ClientDashBorad() {
  const [activeTab, setActiveTab] = useState<"jobs" | "proposals">("jobs");

  return (
    <div className="space-y-8">
      {/* Welcome + Profile Section */}
      {/* <WelcomeAndProfile /> */}

      {/* Tabs */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        {/* Tab Buttons */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-6 py-2 text-sm font-medium transition-colors ${
              activeTab === "jobs"
                ? "text-[#134848] border-b-2 border-[#134848]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Jobs
          </button>
          <button
            onClick={() => setActiveTab("proposals")}
            className={`px-6 py-2 text-sm font-medium transition-colors ${
              activeTab === "proposals"
                ? "text-[#134848] border-b-2 border-[#134848]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Proposals
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "jobs" && <JobsSection />}
          {activeTab === "proposals" && <ReceivedProposals />}
        </div>
      </div>
    </div>
  );
}

export default ClientDashBorad;
