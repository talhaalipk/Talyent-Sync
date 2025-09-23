// src/components/singleJobDetail/JobStats.tsx
import { useJobStore } from "../../store/singleJobstore";

export default function JobStats() {
  const { job } = useJobStore();
  console.log("job : ", job);

  if (!job) return null;

  const stats = [
    { label: "Proposals", value: job.proposalCount },
    { label: "Interviews", value: job.interviewCount },
    { label: "Hired", value: job.hiredCount },
    {
      label: "Status",
      value: (
        <span
          className={`font-bold ${job.status === "published" ? "text-green-500" : "text-red-500"}`}
        >
          {job.status}
        </span>
      ),
    },
  ];

  return (
    <section className="bg-[#F9FAFB] rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Job Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-3 rounded-lg text-center">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="font-bold text-lg">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
