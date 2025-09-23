// src/components/find-jobs/Pagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFindJobStore, usePagination } from "../../store/useFindjob";

export default function Pagination() {
  const pagination = usePagination();
  const { currentPage, setPage, setLimit } = useFindJobStore();

  if (!pagination || pagination.totalPages <= 1) return null;

  const { totalPages, hasNextPage, hasPrevPage, totalJobs, limit } = pagination;

  // Show up to 5 pages at once
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = start + maxVisible - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  // Calculate showing results text
  const startResult = (currentPage - 1) * limit + 1;
  const endResult = Math.min(currentPage * limit, totalJobs);

  return (
    <div className="space-y-4">
      {/* Results info */}
      <div className="text-center text-sm text-gray-600">
        Showing {startResult}-{endResult} of {totalJobs} jobs
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-center space-x-2">
        {/* Previous Button */}
        <button
          className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          onClick={() => setPage(currentPage - 1)}
          disabled={!hasPrevPage}
          title="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        {/* First Page & Ellipsis */}
        {start > 1 && (
          <>
            <button
              onClick={() => setPage(1)}
              className="px-3 py-1 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              1
            </button>
            {start > 2 && <span className="px-2 text-gray-500 select-none">…</span>}
          </>
        )}

        {/* Visible Page Numbers */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => setPage(page)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
              page === currentPage
                ? "bg-[#134848] text-white shadow-sm"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Last Page & Ellipsis */}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-2 text-gray-500 select-none">…</span>}
            <button
              onClick={() => setPage(totalPages)}
              className="px-3 py-1 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          onClick={() => setPage(currentPage + 1)}
          disabled={!hasNextPage}
          title="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Items per page selector */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
        <span>Show:</span>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="px-2 py-1 border border-gray-300 rounded text-sm focus:border-[#2E90EB] focus:ring-1 focus:ring-[#2E90EB] outline-none"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
        </select>
        <span>per page</span>
      </div>
    </div>
  );
}
