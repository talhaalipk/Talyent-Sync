import { Briefcase, Code, PenTool, Palette, Video, BarChart } from "lucide-react";

const categories = [
  { name: "Development", icon: <Code size={28} />, color: "bg-[#134848]" },
  { name: "Design", icon: <Palette size={28} />, color: "bg-[#2E90EB]" },
  { name: "Writing", icon: <PenTool size={28} />, color: "bg-[#10B981]" },
  { name: "Marketing", icon: <BarChart size={28} />, color: "bg-[#F59E0B]" },
  { name: "Video Editing", icon: <Video size={28} />, color: "bg-[#EF4444]" },
  { name: "Business", icon: <Briefcase size={28} />, color: "bg-[#1F2937]" },
];

export default function CategoriesSection() {
  return (
    <section className="py-16 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-[#134848] mb-4">Explore Categories</h2>
        <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
          Browse through the most popular categories and find the right talent for your project.
        </p>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="group cursor-pointer p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center"
            >
              <div
                className={`${cat.color} text-white w-14 h-14 flex items-center justify-center rounded-full mb-3 group-hover:scale-105 transition`}
              >
                {cat.icon}
              </div>
              <p className="font-medium text-gray-800 text-sm">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
