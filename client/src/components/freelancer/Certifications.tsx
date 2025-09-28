import React from "react";
import type { Certification } from "../../store/usePublicFreelancerStore";

interface CertificationsProps {
  certifications: Certification[];
}

const Certifications: React.FC<CertificationsProps> = ({ certifications }) => {
  if (certifications.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-4">Certifications</h3>
      <div className="space-y-3">
        {certifications.map((cert, index) => (
          <div key={index} className="border-l-4 border-[#2E90EB] pl-4 py-2">
            <h4 className="font-medium text-gray-900">{cert.title}</h4>
            <p className="text-sm text-gray-600">{cert.issuer}</p>
            {cert.year && <p className="text-xs text-gray-500 mt-1">{cert.year}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Certifications;
