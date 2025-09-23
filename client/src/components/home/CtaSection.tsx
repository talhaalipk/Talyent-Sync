import React from "react";
import ButtonLink from "../../ui/ButtonLink"; // Adjust the path to where ButtonLink is located

export const CTASection: React.FC = () => {
  return (
    <section className="py-18 bg-teal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* For Clients */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-4">For Clients</h3>
            <p className="text-blue-100 mb-6">
              Find skilled freelancers for your projects. Post jobs, review proposals, and hire the
              best talent from around the world.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-blue-100">
                <svg
                  className="w-5 h-5 mr-3 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Post jobs for free
              </div>
              <div className="flex items-center text-blue-100">
                <svg
                  className="w-5 h-5 mr-3 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Browse verified freelancers
              </div>
              <div className="flex items-center text-blue-100">
                <svg
                  className="w-5 h-5 mr-3 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Secure payment protection
              </div>
            </div>
            <div className="mt-8">
              <ButtonLink
                to="/freelancers" // Use 'to' instead of navigate
                variant="outline"
                // Keep onClick for compatibility
                className="text-lg bg-transparent border-white text-white hover:bg-white hover:text-teal-800 px-6 py-3"
              >
                Hire Freelancers
              </ButtonLink>
            </div>
          </div>

          {/* For Freelancers */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-4">For Freelancers</h3>
            <p className="text-blue-100 mb-6">
              Showcase your skills and connect with clients worldwide. Build your reputation and
              grow your freelance business.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-blue-100">
                <svg
                  className="w-5 h-5 mr-3 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Access millions of projects
              </div>
              <div className="flex items-center text-blue-100">
                <svg
                  className="w-5 h-5 mr-3 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Set your own rates
              </div>
              <div className="flex items-center text-blue-100">
                <svg
                  className="w-5 h-5 mr-3 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Work remotely
              </div>
            </div>
            <div className="mt-8">
              <ButtonLink
                to="/jobs" // Use 'to' instead of navigate
                variant="primary" // Use primary variant to match bg-blue-600
                className="text-lg px-6 py-3" // Replicate size="lg" and adjust padding
              >
                Start Freelancing
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
