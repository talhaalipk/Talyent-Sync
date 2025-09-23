// src/components/find-jobs/FiltersPanel.tsx
import categories from "./categories";
import type { Category } from "./categories";
import { useFindJobStore } from "../../store/useFindjob";

export default function FiltersPanel() {
  const {
    // States
    search,
    category,
    subcategory,
    jobType,
    experienceLevel,
    budgetMin,
    budgetMax,
    filters,

    // Actions
    setSearch,
    setCategory,
    setSubcategory,
    setJobType,
    setExperienceLevel,
    setBudgetMin,
    setBudgetMax,
    resetFilters,
  } = useFindJobStore();

  const selectedCategory: Category | undefined = categories.find((cat) => cat.slug === category);

  return (
    <div className="space-y-6 divide-y divide-gray-100 max-h-[80vh] overflow-y-auto pr-2">
      {/* Search */}
      <div className="pt-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1">🔍 Search</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs..."
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#2E90EB] focus:ring-2 focus:ring-[#2E90EB]/30 outline-none transition"
        />
      </div>

      {/* Category */}
      <div className="pt-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">📂 Category</label>
        <select
          value={category || ""}
          onChange={(e) => setCategory(e.target.value || null)}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#2E90EB] focus:ring-2 focus:ring-[#2E90EB]/30 outline-none transition"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory */}
      {selectedCategory && (
        <div className="pt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">📑 Subcategory</label>
          <select
            value={subcategory || ""}
            onChange={(e) => setSubcategory(e.target.value || null)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#2E90EB] focus:ring-2 focus:ring-[#2E90EB]/30 outline-none transition"
          >
            <option value="">All Subcategories</option>
            {selectedCategory.subcategories.map((sub) => (
              <option key={sub.slug} value={sub.slug}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Job Type */}
      <div className="pt-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">💼 Job Type</p>
        <div className="flex gap-4">
          {["fixed", "hourly"].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="jobType"
                value={type}
                checked={jobType === type}
                onChange={() => setJobType(type as "fixed" | "hourly")}
                className="text-[#2E90EB] focus:ring-[#2E90EB] cursor-pointer"
              />
              <span className="capitalize text-sm">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="pt-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">🎯 Experience Level</p>
        <div className="flex flex-col gap-2">
          {["entry", "intermediate", "expert"].map((level) => (
            <label key={level} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="experienceLevel"
                value={level}
                checked={experienceLevel === level}
                onChange={() => setExperienceLevel(level as "entry" | "intermediate" | "expert")}
                className="text-[#2E90EB] focus:ring-[#2E90EB] cursor-pointer"
              />
              <span className="capitalize text-sm">
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Budget Range */}
      <div className="pt-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">💰 Budget Range ($)</p>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Min"
            value={budgetMin ?? ""}
            onChange={(e) => setBudgetMin(e.target.value ? +e.target.value : null)}
            className="w-1/2 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#2E90EB] focus:ring-2 focus:ring-[#2E90EB]/30 outline-none transition"
          />
          <input
            type="number"
            placeholder="Max"
            value={budgetMax ?? ""}
            onChange={(e) => setBudgetMax(e.target.value ? +e.target.value : null)}
            className="w-1/2 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-[#2E90EB] focus:ring-2 focus:ring-[#2E90EB]/30 outline-none transition"
          />
        </div>
      </div>

      {/* Reset Filters Button */}
      <div className="pt-4">
        <button
          onClick={resetFilters}
          className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
        >
          🔄 Reset Filters
        </button>
      </div>

      {/* Available Categories Info (if API provides it) */}
      {filters && filters.categories && (
        <div className="pt-4">
          <p className="text-xs text-gray-500 mb-1">Available Categories:</p>
          <div className="text-xs text-gray-400">{filters.categories.join(", ")}</div>
        </div>
      )}
    </div>
  );
}
