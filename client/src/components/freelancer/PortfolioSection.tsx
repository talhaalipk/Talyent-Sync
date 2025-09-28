import React from "react";
import { ExternalLink } from "lucide-react";
import type { PortfolioItem } from "../../store/usePublicFreelancerStore";

interface PortfolioSectionProps {
  portfolio: PortfolioItem[];
}

const PortfolioSection: React.FC<PortfolioSectionProps> = ({ portfolio }) => {
  if (portfolio.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {portfolio.map((item, index) => (
          <div
            key={index}
            className="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-[#2E90EB]"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900 group-hover:text-[#2E90EB] transition-colors">
                {item.title}
              </h3>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2E90EB] hover:text-blue-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            {item.description && (
              <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioSection;
