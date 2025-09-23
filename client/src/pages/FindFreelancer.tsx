import { useEffect } from "react";
import { useFreelancerStore } from "../store/useFreelancerStore";
import FilterSection from "../components/findFreelancer/FilterSection";
import FreelancerCard from "../components/findFreelancer/FreelancerCard";
import Pagination from "../components/findFreelancer/Pagination";

export default function FindFreelancer() {
  const { freelancers, fetchFreelancers, pagination, loading } = useFreelancerStore();

  useEffect(() => {
    fetchFreelancers();
  }, [fetchFreelancers]);

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Find Top Freelancers</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Left */}
        <div className="md:col-span-1">
          <FilterSection />
        </div>

        {/* Freelancers Right */}
        <div className="md:col-span-3">
          {loading ? (
            <p>Loading freelancers...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {freelancers.map((freelancer) => (
                <FreelancerCard key={freelancer._id} freelancer={freelancer} />
              ))}
            </div>
          )}

          {pagination && (
            <div className="mt-6">
              <Pagination pagination={pagination} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
