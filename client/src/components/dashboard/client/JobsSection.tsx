// src/components/dashboard/JobsSection.tsx
import { useState } from "react";
import Button from "../../../ui/Button";
import EditJob from "./EditJob"; // adjust path if different
import ClientJobs from "./ClientJobs";

export default function JobsSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddJob = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // const handleSubmitJob = (form: any) => {
  // 	console.log("Job submitted:", form);
  // 	// later you can call your API here
  // 	setIsModalOpen(false);
  // };

  return (
    <section className="bg-white rounded-2xl p-6 mb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#134848]">Your Jobs</h2>
        <div className="w-32">
          <Button text="Add Job" onClick={handleAddJob} />
        </div>
      </div>

      {/* Jobs List (placeholder for now) */}
      <ClientJobs />

      {/* Modal */}
      {isModalOpen && (
        // <EditJob onClose={handleCloseModal} onSubmit={handleSubmitJob} />
        <EditJob onClose={handleCloseModal} />
      )}
    </section>
  );
}
