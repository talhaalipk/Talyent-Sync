// src/components/Admin/FilterButtons.tsx
interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterButtonsProps {
  options: FilterOption[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FilterButtons = ({ options, activeFilter, onFilterChange }: FilterButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onFilterChange(option.value)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeFilter === option.value
              ? "bg-[#134848] text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {option.label} ({option.count})
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;
