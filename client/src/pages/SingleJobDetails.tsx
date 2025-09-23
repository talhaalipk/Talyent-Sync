import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useJobStore } from "../store/singleJobstore";
import JobOverview from "../components/singleJobDetail/JobOverview";
import JobDescription from "../components/singleJobDetail/JobDescription";
import SkillsRequired from "../components/singleJobDetail/SkillsRequired";
import ClientInfo from "../components/singleJobDetail/ClientInfo";
import JobStats from "../components/singleJobDetail/JobStats";

export default function SingleJobDetails() {
  const { id } = useParams<{ id: string }>();
  const { fetchJob, loading, job } = useJobStore();

  useEffect(() => {
    if (id) fetchJob(id);
  }, [id, fetchJob]);

  if (loading) {
    return <div className="text-center py-10">Loading job details...</div>;
  }

  if (!job) {
    return <div className="text-center py-10">Job not found</div>;
  }

  return (
    <div className="bg-white font-sans text-[#1F2937] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Overview */}
        <JobOverview />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2">
            <JobDescription />
            <SkillsRequired />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <ClientInfo />
            <JobStats />
          </div>
        </div>
      </div>
    </div>
  );
}
