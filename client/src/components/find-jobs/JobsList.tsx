// src/components/find-jobs/JobsList.tsx
import { motion } from "framer-motion";
import { useFindJobStore, useJobs, useLoading, useError } from "../../store/useFindjob";
import JobCard from "./JobCard";

export default function JobsList() {
  const jobs = useJobs();
  const loading = useLoading();
  const error = useError();
  const { clearError } = useFindJobStore();

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-600 mb-3">❌ {error}</p>
          <button
            onClick={clearError}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="flex gap-2 mt-4">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // No jobs state
  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No jobs found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search criteria or filters to find more opportunities.
          </p>
          <button
            onClick={() => useFindJobStore.getState().resetFilters()}
            className="px-6 py-2 text-sm font-medium text-white bg-[#134848] rounded-xl hover:bg-[#0f3737] transition"
          >
            Reset Filters
          </button>
        </div>
      </div>
    );
  }

  // Jobs list
  return (
    <div className="space-y-6">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{jobs.length} jobs found</p>
      </div>

      {/* Jobs grid */}
      <div className="grid gap-6">
        {jobs.map((job, index) => (
          <motion.div
            key={job._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1, // Stagger animation
            }}
          >
            <JobCard job={job} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
