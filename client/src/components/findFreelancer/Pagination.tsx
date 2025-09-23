import { useFreelancerStore } from "../../store/useFreelancerStore";

interface PaginationProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
    nextPage?: number | null;
    prevPage?: number | null;
  };
}

export default function Pagination({ pagination }: PaginationProps) {
  const { fetchFreelancers } = useFreelancerStore();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchFreelancers(page);
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Prev Button */}
      <button
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={!pagination.hasPrevPage}
        className="px-4 py-2 rounded-lg border bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-100"
      >
        Prev
      </button>

      {/* Page Numbers */}
      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-4 py-2 rounded-lg border ${
            page === pagination.currentPage
              ? "bg-[#2E90EB] text-white border-[#2E90EB]"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={!pagination.hasNextPage}
        className="px-4 py-2 rounded-lg border bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-100"
      >
        Next
      </button>
    </div>
  );
}
