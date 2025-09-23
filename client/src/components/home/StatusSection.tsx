import React from "react";
import { TrendingUp, Users, Briefcase, Award } from "lucide-react";

export const StatusSection: React.FC = () => {
  const stats = [
    {
      icon: Briefcase,
      value: "2.5M+",
      label: "Jobs Posted",
      description: "Across all categories",
    },
    {
      icon: Users,
      value: "500K+",
      label: "Freelancers",
      description: "Ready to work",
    },
    {
      icon: TrendingUp,
      value: "$2.8B+",
      label: "Paid to Freelancers",
      description: "Growing every day",
    },
    {
      icon: Award,
      value: "98%",
      label: "Satisfaction Rate",
      description: "Happy clients",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by millions worldwide</h2>
          <p className="text-xl text-gray-600">Join the world's largest freelancing marketplace</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg mb-4">
                  <IconComponent className="w-6 h-6 text-teal-800" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-lg font-medium text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
