// src/components/singleJobDetail/JobDescription.tsx
import { useJobStore } from "../../store/singleJobstore";

export default function JobDescription() {
  const { job } = useJobStore();

  if (!job) return null;

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Job Description</h2>
      <div className="bg-[#F9FAFB] rounded-lg p-6">
        {/* Category & Subcategory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold text-gray-600">Category:</p>
            <span className="inline-block mt-1 bg-blue-100 text-blue-800 text-base font-medium px-3 py-1 rounded-full">
              {job.category || "Not specified"}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Subcategory:</p>
            <span className="inline-block mt-1 bg-green-100 text-green-800 text-base font-medium px-3 py-1 rounded-full">
              {job.subcategory || "Not specified"}
            </span>
          </div>
        </div>

        {/* Job Description */}
        <p className="mb-4 text-gray-700 leading-relaxed">{job.description}</p>

        {/* Attachments */}
        {job.attachments?.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Attachments</h3>
            <ul className="list-disc pl-6 space-y-1">
              {job.attachments.map((file, i) => (
                <li key={i}>
                  <a
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {file}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
