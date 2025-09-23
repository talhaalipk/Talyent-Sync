import { useFreelancerStore } from "../../store/useFreelancerStore";

export default function FilterSection() {
  const { setFilters, fetchFreelancers } = useFreelancerStore();

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ [key]: value });
    fetchFreelancers(); // refresh after filter
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border">
      <h3 className="text-lg font-semibold mb-3">Filters</h3>

      <label className="block mb-2 text-sm">Min Rating</label>
      <input
        type="number"
        min="0"
        max="5"
        step="0.1"
        onChange={(e) => handleFilterChange("minRating", e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />

      <label className="block mb-2 text-sm">Location</label>
      <input
        type="text"
        placeholder="Enter location"
        onChange={(e) => handleFilterChange("location", e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />
    </div>
  );
}
