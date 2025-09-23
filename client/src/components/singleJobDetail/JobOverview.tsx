import { useState } from "react";
import ProposalModal from "./ProposalModal";
import { Clock, DollarSign, Award, Calendar } from "lucide-react";
import Button from "../../ui/Button";
import { useAuthStore } from "../../store/authStore";
import { useJobStore } from "../../store/singleJobstore";
import { toast } from "react-hot-toast";

// Define job type based on your API response

export default function JobOverview() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoggedIn, user } = useAuthStore();
  const { job } = useJobStore();

  const handleApplyClick = () => {
    if (!isLoggedIn) {
      toast.error("Please login first.");
      return;
    }

    if (user?.role !== "freelancer") {
      toast.error("Only Freelancer can apply for jobs.");
      return;
    }

    setIsModalOpen(true);
  };

  if (!job) {
    return (
      <section className="mb-12">
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mb-12">
        <div className="bg-[#134848] rounded-lg p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Job Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{job.title}</h1>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{job.category}</span>
                {job.skillsRequired.slice(0, 2).map((skill) => (
                  <span key={skill} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
                {job["createdAt"] && (
                  <span className="bg-[#2E90EB] px-3 py-1  rounded-full text-sm">
                    Posted at : {new Date(job["createdAt"] as string).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Type : </span>
                  <span>{job.jobType}</span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {job.jobType === "hourly" ? (
                    job.budget.hourlyRate ? (
                      <span>
                        {job.budget.currency} : {job.budget.hourlyRate.min} -{" "}
                        {job.budget.hourlyRate.max}/hr
                      </span>
                    ) : (
                      <span>Hourly rate not specified</span>
                    )
                  ) : job.jobType === "fixed" ? (
                    job.budget.amount ? (
                      <span>
                        {job.budget.currency} : {job.budget.amount}
                      </span>
                    ) : (
                      <span>Fixed budget not specified</span>
                    )
                  ) : (
                    <span>Budget not specified</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span className="capitalize">{job.experienceLevel}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{job.duration.estimate}+ days</span>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="min-w-[150px]">
              <Button text="Apply Now" onClick={handleApplyClick} />
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <ProposalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
