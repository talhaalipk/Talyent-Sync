import { useState } from "react";
import toast from "react-hot-toast";
import { useJobStore } from "../../../store/jobStore";
import EditJob from "./EditJob";

interface JobCardProps {
  job: any;
  onRefresh: () => void;
}

export default function JobCard({ job, onRefresh }: JobCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"update" | "delete" | null>(null);

  const { deleteJob } = useJobStore();

  const handleDelete = async () => {
    setLoadingAction("delete");
    try {
      await deleteJob(job._id);
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete job");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdate = () => {
    setIsEditOpen(true);
  };

  return (
    <>
      <div className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-[#F9FAFB] shadow-sm hover:shadow-md transition h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-[#134848] truncate">
              {job.title}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {job.category} • {job.subcategory}
            </p>
          </div>
          <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
            {job.status || "draft"}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 mt-3 text-sm sm:text-base line-clamp-2">{job.description}</p>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-3">
          <div className="text-sm text-gray-500">
            {job.jobType === "fixed"
              ? `Fixed: $${job.budget.amount}`
              : `Hourly: $${job.budget.hourlyRate.min} - $${job.budget.hourlyRate.max}`}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Update Button */}
            <button
              onClick={handleUpdate}
              disabled={loadingAction === "update"}
              className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition
								${
                  loadingAction === "update"
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }
							`}
            >
              {loadingAction === "update" ? "Updating..." : "Update"}
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={loadingAction === "delete"}
              className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition
								${
                  loadingAction === "delete"
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }
							`}
            >
              {loadingAction === "delete" ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Edit Modal */}
      {isEditOpen && (
        <EditJob
          job={job}
          onClose={() => {
            setIsEditOpen(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
