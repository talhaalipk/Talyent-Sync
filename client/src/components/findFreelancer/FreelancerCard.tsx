import { useNavigate } from "react-router-dom";
import type { Freelancer } from "../../store/useFreelancerStore";
import { Star, Award, Calendar } from "lucide-react";

export default function FreelancerCard({ freelancer }: { freelancer: Freelancer }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white p-6 rounded-2xl  shadow-md hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={freelancer.profilePic || "/default-avatar.png"}
          alt={freelancer.name}
          className="w-16 h-16 rounded-full object-cover border border-gray-200"
        />
        <div>
          {/* Name as main title */}
          <p className="font-bold text-gray-900 text-xl leading-tight">{freelancer.name}</p>
          {/* Username smaller & muted */}
          <p className="text-md font-semibold text-gray-700">{freelancer.UserName}</p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {freelancer.freelancerProfile.bio_desc || "No bio available."}
      </p>

      {/* Skills */}
      {freelancer.freelancerProfile.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {freelancer.freelancerProfile.skills.slice(0, 5).map((skill, i) => (
            <span key={i} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Star className="text-yellow-500" size={16} />
          <span>
            {freelancer.freelancerProfile.ratingAvg.toFixed(1)} (
            {freelancer.freelancerProfile.ratingCount} reviews)
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Award className="text-green-500" size={16} />
          <span>{freelancer.freelancerProfile.successRate}% success</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="text-blue-500" size={16} />
          <span>
            Member since{" "}
            {new Date(freelancer?.createdAt).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="text-gray-900 font-semibold">
          ${freelancer.freelancerProfile.hourlyRate || 0}/hr
        </div>
      </div>

      {/* CTA */}
      <button
        className="mt-auto bg-[#2E90EB] text-white text-sm font-medium py-2 px-4 rounded-xl hover:bg-[#1e6fc4] transition"
        onClick={() => navigate(`/freelancer/${freelancer._id}`)}
      >
        View Profile
      </button>
    </div>
  );
}
