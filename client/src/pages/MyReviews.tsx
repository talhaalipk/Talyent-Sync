// src/pages/MyReviews.tsx
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useReviewStore } from "../store/reviewStore";
import PleaseLogin from "../components/PleaseLogin";
import Spinner from "../ui/Spinner";
import ReviewCard from "../components/reviews/ReviewCard";
import ReviewStats from "../components/reviews/ReviewStats";

const MyReviews = () => {
  const { isLoggedIn, user } = useAuthStore();
  const { myReviews, loading, error, fetchMyReviews } = useReviewStore();

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchMyReviews();
    }
  }, [isLoggedIn, user, fetchMyReviews]);

  if (!isLoggedIn) {
    return <PleaseLogin />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#134848] mb-2">My Reviews</h1>
          <p className="text-[#1F2937]">
            View all reviews you've received and given on completed projects
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!myReviews ? (
          <div className="bg-[#F9FAFB] rounded-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-[#134848] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#134848]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#134848] mb-2">No Reviews Yet</h3>
              <p className="text-[#1F2937]">
                Complete some projects to start receiving reviews and build your reputation!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Review Statistics */}
            <ReviewStats stats={myReviews.stats} userRole={user?.role || "freelancer"} />

            {/* Reviews Received Section */}
            <div>
              <h2 className="text-2xl font-semibold text-[#134848] mb-6">
                Reviews Received ({myReviews.reviewsReceived.length})
              </h2>

              {myReviews.reviewsReceived.length === 0 ? (
                <div className="bg-[#F9FAFB] rounded-lg p-8 text-center">
                  <p className="text-[#1F2937]">You haven't received any reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myReviews.reviewsReceived.map((review) => (
                    <ReviewCard key={review._id} review={review} type="received" />
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Given Section */}
            <div>
              <h2 className="text-2xl font-semibold text-[#134848] mb-6">
                Reviews Given ({myReviews.reviewsGiven.length})
              </h2>

              {myReviews.reviewsGiven.length === 0 ? (
                <div className="bg-[#F9FAFB] rounded-lg p-8 text-center">
                  <p className="text-[#1F2937]">You haven't given any reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myReviews.reviewsGiven.map((review) => (
                    <ReviewCard key={review._id} review={review} type="given" />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;
