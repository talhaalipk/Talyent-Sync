// src/components/singleJobDetail/SkillsRequired.tsx
import { useJobStore } from "../../store/singleJobstore";

export default function SkillsRequired() {
  const { job } = useJobStore();

  if (!job || !job.skillsRequired?.length) return null;

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Skills Required</h2>
      <div className="flex flex-wrap gap-2">
        {job.skillsRequired.map((skill, index) => (
          <span key={`${skill}-${index}`} className="bg-[#F9FAFB] px-4 py-2 rounded-full text-sm">
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
