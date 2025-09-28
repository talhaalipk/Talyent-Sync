import React from "react";
import { Star } from "lucide-react";
import type { Review } from "../../store/usePublicFreelancerStore";

interface ReviewsSectionProps {
  reviews: Review[];
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Reviews</h2>
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0"
            >
              <div className="flex items-start gap-4">
                <img
                  src={
                    review.client.profilePic ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(review.client.name)}&background=134848&color=fff&size=50`
                  }
                  alt={review.client.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">{review.client.name}</span>
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-[#2E90EB] font-medium mb-2">
                    Project: {review.jobTitle}
                  </p>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">
              No reviews yet. Be the first to work with this freelancer!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
