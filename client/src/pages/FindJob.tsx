// src/pages/FindJobs.tsx
import { useEffect } from "react";
import FiltersPanel from "../components/find-jobs/FiltersPanel";
import JobsList from "../components/find-jobs/JobsList";
import Pagination from "../components/find-jobs/Pagination";
import { useFindJobStore, usePagination, useLoading } from "../store/useFindjob";

export default function FindJobs() {
  const pagination = usePagination();
  const loading = useLoading();
  const { searchJobs } = useFindJobStore();

  // Fetch jobs on mount (only if not already loaded)
  useEffect(() => {
    const state = useFindJobStore.getState();
    if (!state.jobs.length && !state.loading) {
      searchJobs();
    }
  }, [searchJobs]);

  useEffect(() => {
    searchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-4">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-[#134848]">Find the Perfect Job</h1>
        <p className="text-gray-600 mt-2 text-base md:text-lg">
          Browse opportunities that match your skills, experience, and goals.
        </p>

        {/* Total jobs count */}
        {pagination && !loading && (
          <div className="mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              📊 {pagination.totalJobs} total opportunities
            </span>
          </div>
        )}
      </header>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Filters */}
        <aside className="lg:col-span-1 bg-white rounded-2xl shadow-md p-6 max-h-[90vh] overflow-y-auto pr-2 ">
          <FiltersPanel />
        </aside>

        {/* Right: Jobs + Pagination */}
        <section className="lg:col-span-3">
          <JobsList />

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <Pagination />
          </div>
        </section>
      </main>
    </div>
  );
}
