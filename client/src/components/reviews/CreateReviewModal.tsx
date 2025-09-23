// src/components/reviews/CreateReviewModal.tsx
import { useState, useEffect } from "react";
import { useReviewStore } from "../../store/reviewStore";
import Button from "../../ui/Button";

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  otherUserName: string;
  jobTitle: string;
  userRole: "client" | "freelancer";
}

const CreateReviewModal = ({
  isOpen,
  onClose,
  contractId,
  otherUserName,
  jobTitle,
  userRole,
}: CreateReviewModalProps) => {
  const { createReview, checkReviewEligibility } = useReviewStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [canReview, setCanReview] = useState(true);
  const [eligibilityMessage, setEligibilityMessage] = useState("");
  // const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && contractId) {
      checkEligibility();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, contractId]);

  const checkEligibility = async () => {
    const result = await checkReviewEligibility(contractId);
    setCanReview(result.canReview);
    setEligibilityMessage(result.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🔍 Form submitted with:", { contractId, rating, comment: comment.trim() });

    if (!comment.trim()) {
      alert("Please provide a comment");
      return;
    }

    // setIsSubmitting(true);
    console.log("📤 Calling createReview...");

    const success = await createReview(contractId, {
      rating,
      comment: comment.trim(),
    });

    console.log("📥 createReview result:", success);

    // setIsSubmitting(false);

    if (success) {
      // Reset form
      setRating(5);
      setComment("");
      setHoveredRating(0);
      onClose();
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = hoveredRating ? starValue <= hoveredRating : starValue <= rating;

      return (
        <button
          key={index}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className={`w-8 h-8 transition-colors ${
            isActive ? "text-yellow-400 fill-current" : "text-gray-300 hover:text-yellow-300"
          }`}
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-blue-200/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-[#134848]">Leave a Review</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Project Info */}
          <div className="bg-[#F9FAFB] rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Project:</p>
            <p className="font-medium text-[#134848]">{jobTitle}</p>
            <p className="text-sm text-gray-600 mt-2">
              Review for: <span className="font-medium">{otherUserName}</span>
            </p>
          </div>

          {!canReview ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">{eligibilityMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Rating</label>
                <div className="flex items-center gap-1 mb-2">{renderStars()}</div>
                <p className="text-sm text-gray-600">
                  {rating === 1 && "Poor - Very unsatisfied"}
                  {rating === 2 && "Fair - Below expectations"}
                  {rating === 3 && "Good - Met expectations"}
                  {rating === 4 && "Very Good - Exceeded expectations"}
                  {rating === 5 && "Excellent - Outstanding work"}
                </p>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`Share your experience working ${userRole === "client" ? "with this freelancer" : "with this client"}. What went well? Any areas for improvement?`}
                  rows={4}
                  maxLength={1000}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E90EB]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{comment.length}/1000 characters</p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button text={"Submit Review"} type="submit" />
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateReviewModal;
