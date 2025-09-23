// src/components/dashboard/ClientJobs.tsx
import { useEffect } from "react";
import { useJobStore } from "../../../store/jobStore";
import { useUserStore } from "../../../store/userStore";
import JobCard from "./JobCard";

export default function ClientJobs() {
  const { profile } = useUserStore();
  const { jobs, loading, error, fetchJobs } = useJobStore();

  useEffect(() => {
    if (profile?._id) {
      fetchJobs(profile._id); // ✅ now uses store function
    }
  }, [profile?._id, fetchJobs]);

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-2xl p-6 text-center">
        <p className="text-gray-500 animate-pulse">Loading your jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-md rounded-2xl p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-2xl p-6 mb-8">
      {jobs.length === 0 ? (
        <p className="text-gray-500 text-center">No jobs found. Post your first job!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} onRefresh={() => fetchJobs(profile._id)} />
          ))}
        </div>
      )}
    </section>
  );
}
