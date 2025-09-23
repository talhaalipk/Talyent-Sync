// src/components/reviews/ReviewCard.tsx
import type { Review } from "../../store/reviewStore";

interface ReviewCardProps {
  review: Review;
  type: "received" | "given";
}

const ReviewCard = ({ review, type }: ReviewCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));
  };

  const otherUser = type === "received" ? review.reviewerId : review.revieweeId;
  const isClientReview = review.reviewType === "client_to_freelancer";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* User Info */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <img
            src={otherUser.profilePic}
            alt={otherUser.name || otherUser.UserName}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-[#134848] truncate">
                {otherUser.name || otherUser.UserName}
              </h4>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  type === "received" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                }`}
              >
                {type === "received" ? "Received" : "Given"}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">{review.jobId.title}</p>
          </div>
        </div>

        {/* Rating and Date */}
        <div className="flex items-center justify-between lg:flex-col lg:items-end gap-2">
          <div className="flex items-center gap-1">
            {renderStars(review.rating)}
            <span className="ml-2 text-sm font-medium text-[#134848]">{review.rating}/5</span>
          </div>
          <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
        </div>
      </div>

      {/* Review Comment */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-[#1F2937] leading-relaxed">"{review.comment}"</p>
      </div>

      {/* Project Info */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h2M7 7h.01M7 11h.01M7 15h.01"
              />
            </svg>
            {review.jobId.category}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {isClientReview ? "Client Review" : "Freelancer Review"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
