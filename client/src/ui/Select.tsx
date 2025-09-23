import { type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export default function Select({ label, children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Label */}
      <label className="text-sm font-medium text-gray-800">{label}</label>

      {/* Wrapper with custom icon */}
      <div className="relative">
        <select
          {...props}
          className="
            w-full appearance-none
            border border-gray-300 
            rounded-xl px-4 py-2.5 pr-10
            text-sm text-gray-800
            bg-white shadow-sm
            focus:outline-none focus:ring-2 focus:ring-[#2E90EB] focus:border-[#2E90EB]
            transition-all duration-200
          "
        >
          {children}
        </select>

        {/* Custom Chevron */}
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          size={18}
        />
      </div>
    </div>
  );
}
