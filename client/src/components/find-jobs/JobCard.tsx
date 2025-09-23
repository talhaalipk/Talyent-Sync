import { motion } from "framer-motion";
import { MapPin, Star, DollarSign, Clock, Briefcase, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JobCardProps {
  job: any; // replace `any` with your Job type
}

export default function JobCard({ job }: JobCardProps) {
  console.log("Job Data:", job);
  const navigate = useNavigate();
  const handleDetailsClick = () => {
    navigate(`/jobs/${job._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition cursor-pointer"
    >
      {/* Top Row - Client Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={job.clientId?.profilePic || "/default-avatar.png"}
            alt={job.client?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{job.client?.name}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400" />
                {job.clientId?.clientProfile?.clientRating || "N/A"}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-gray-400" />
                {job.clientId?.clientProfile?.location || "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Job Title */}
      <h3 className="text-lg font-bold text-[#134848] mt-4 hover:underline">{job.title}</h3>

      {/* Description */}
      <p className="text-gray-600 text-sm mt-2 line-clamp-3">{job.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
          {job.category}
        </span>
        <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
          {job.subcategory}
        </span>
        {job.skillsRequired?.slice(0, 3).map((skill: string, idx: number) => (
          <span key={idx} className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
            {skill}
          </span>
        ))}
        {job.skillsRequired?.length > 3 && (
          <span className="px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
            +{job.skillsRequired.length - 3} more
          </span>
        )}
      </div>

      {/* Budget & Duration */}
      <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <DollarSign size={16} className="text-gray-400" />
          {job.jobType === "fixed"
            ? `$${job.budget.amount} ${job.budget.currency}`
            : `$${job.budget.hourlyRate.min} - $${job.budget.hourlyRate.max}/hr`}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={16} className="text-gray-400" />
          {job.duration?.estimate}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={16} className="text-gray-400" />
          {job.experienceLevel}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-5 text-xs text-gray-500">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <Users size={14} className="text-gray-400" />
            {job.proposals || 0} Proposals
          </span>
          <span>{job.interviews || 0} Interviews</span>
          <span>Status: {job.status || "open"}</span>
        </div>

        <button
          onClick={handleDetailsClick}
          className="px-4 py-2 text-sm font-medium text-white bg-[#134848] rounded-xl hover:bg-[#0f3737] transition"
        >
          See More ...
        </button>
      </div>
    </motion.div>
  );
}
