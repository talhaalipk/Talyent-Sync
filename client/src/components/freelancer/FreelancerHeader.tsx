import React from "react";
import { Star, MapPin, Calendar } from "lucide-react";
import type { PublicFreelancerProfile } from "../../store/usePublicFreelancerStore";

interface FreelancerHeaderProps {
  freelancer: PublicFreelancerProfile;
}

const FreelancerHeader: React.FC<FreelancerHeaderProps> = ({ freelancer }) => {
  const renderStars = (rating: number, size: "sm" | "md" = "md") => {
    const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <img
              src={
                freelancer.profilePic ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancer.name)}&background=134848&color=fff&size=200`
              }
              alt={freelancer.name}
              className="w-24 h-24 rounded-full object-cover shadow-lg ring-4 ring-white"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold text-gray-900 truncate">{freelancer.name}</h1>
                <p className="text-lg text-gray-600 mb-2">@{freelancer.username}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {freelancer.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{freelancer.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {new Date(freelancer.memberSince).getFullYear()}</span>
                  </div>
                </div>
              </div>

              <div className="text-right sm:text-left">
                <div className="flex items-center gap-2 sm:justify-end mb-2">
                  {renderStars(freelancer.ratingAvg, "md")}
                  <span className="font-semibold text-lg">{freelancer.ratingAvg.toFixed(1)}</span>
                  <span className="text-gray-600">({freelancer.ratingCount})</span>
                </div>
                <p className="text-3xl font-bold text-[#134848]">
                  ${freelancer.hourlyRate}
                  <span className="text-lg font-normal text-gray-600">/hr</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerHeader;
