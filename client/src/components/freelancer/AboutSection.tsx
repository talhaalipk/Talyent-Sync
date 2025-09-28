import React from "react";

interface AboutSectionProps {
  bio: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ bio }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
      <p className="text-gray-700 leading-relaxed">
        {bio || "This freelancer prefers to let their work speak for itself."}
      </p>
    </div>
  );
};

export default AboutSection;
