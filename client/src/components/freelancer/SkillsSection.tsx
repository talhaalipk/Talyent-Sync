import React from "react";

interface SkillsSectionProps {
  skills: string[];
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  if (skills.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills & Expertise</h2>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="px-4 py-2 bg-gradient-to-r from-[#134848] to-[#1a5a5a] text-white rounded-full text-sm font-medium hover:shadow-md transition-shadow"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SkillsSection;
