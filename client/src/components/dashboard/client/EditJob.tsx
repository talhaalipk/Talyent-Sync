import { useState, useEffect } from "react";
import Input from "../../../ui/Input";
import Select from "../../../ui/Select";
import Button from "../../../ui/Button";
import { ArrowLeft, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useJobStore, type Job } from "../../../store/jobStore";
import emptyfromdata from "./emptyfromdata";
import categories from "./categories";
import api from "../../../utils/axiosInstance"; // Your existing API utility

interface EditJob {
  job?: Job; // optional → if passed, we're editing
  onClose: () => void;
}

export default function EditJob({ job, onClose }: EditJob) {
  const { addJob, updateJob } = useJobStore();
  const [form, setForm] = useState<Job>(emptyfromdata as Job);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // detect edit mode
  const isEdit = Boolean(job);

  useEffect(() => {
    if (job) {
      setForm(job); // preload job data into form when editing
    } else {
      setForm(emptyfromdata as Job);
    }
  }, [job]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBudgetChange = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      budget: { ...prev.budget, [field]: value },
    }));
  };

  // ✅ AI Validation - only check required fields for AI generation
  const validateAIFields = () => {
    if (!form.title.trim()) return "Job Title is required for AI generation";
    if (!form.category.trim()) return "Category is required for AI generation";
    if (!form.subcategory.trim()) return "Subcategory is required for AI generation";
    if (!form.jobType.trim()) return "Job Type is required for AI generation";
    return null;
  };

  // ✅ Generate Job Description and Skills with AI
  const handleGenerateWithAI = async () => {
    const error = validateAIFields();
    if (error) {
      toast.error(error);
      return;
    }

    setIsGeneratingAI(true);
    const loadingToast = toast.loading("Generating job description and skills with AI...");

    try {
      const response = await api.post("/jobs/generatejobdescription", {
        title: form.title,
        category: form.category,
        subcategory: form.subcategory,
        type: form.jobType,
      });

      // Update form with AI generated content
      if (response.data?.description) {
        console.log(response.data);
        setForm((prev) => ({
          ...prev,
          description: response.data.description,
          // Convert skills string to array for skillsRequired field
          skillsRequired: response.data.skills
            ? response.data.skills
                .split(",")
                .map((skill: string) => skill.trim())
                .filter((skill: string) => skill.length > 0)
            : prev.skillsRequired,
        }));

        toast.success("Job description and skills generated successfully!");
      } else {
        toast.error("No description received from AI");
      }
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      const errorMessage = error.response?.data?.message || "Failed to generate job details";
      toast.error(errorMessage);
    } finally {
      toast.dismiss(loadingToast);
      setIsGeneratingAI(false);
    }
  };

  // ✅ Validation
  const validateForm = () => {
    if (!form.title.trim()) return "Job Title is required";
    if (!form.category.trim()) return "Category is required";
    if (!form.description.trim()) return "Job Description is required";
    if (form.jobType === "fixed" && (!form.budget.amount || form.budget.amount <= 0))
      return "Budget amount is required";
    if (
      form.jobType === "hourly" &&
      ((form.budget.hourlyRate?.min ?? 0) <= 0 || (form.budget.hourlyRate?.max ?? 0) <= 0)
    )
      return "Hourly rate range is required";
    return null;
  };

  // ✅ Handle submit for both create + update
  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    if (isEdit && job?._id) {
      await updateJob(job._id, form);
      toast.success("Job updated successfully!");
    } else {
      await addJob(form);
    }

    onClose();
    setForm(emptyfromdata as Job);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start overflow-y-auto z-50">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl p-6 my-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
            <ArrowLeft className="text-gray-600" size={22} />
          </button>
          <h2 className="text-2xl font-bold text-[#134848]">
            {isEdit ? "Update Job" : "Create New Job"}
          </h2>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Job Title"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
          />
          {/* Category Dropdown */}
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => {
              const selectedCategory = e.target.value;
              handleChange("category", selectedCategory);
              handleChange("subcategory", ""); // reset subcategory when category changes
            }}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </Select>

          {/* Subcategory Dropdown */}
          <Select
            label="Subcategory"
            value={form.subcategory}
            onChange={(e) => handleChange("subcategory", e.target.value)}
            disabled={!form.category} // disable until category is selected
          >
            <option value="">Select Subcategory</option>
            {categories
              .find((cat) => cat.slug === form.category)
              ?.subcategories.map((sub) => (
                <option key={sub.slug} value={sub.slug}>
                  {sub.name}
                </option>
              ))}
          </Select>

          <Select
            label="Job Type"
            value={form.jobType}
            onChange={(e) => {
              const value = e.target.value as "fixed" | "hourly";
              handleChange("jobType", value);
              setForm((prev) => ({
                ...prev,
                jobType: value,
                budget: {
                  ...prev.budget,
                  jobType: value, // ✅ keep budget.jobType in sync
                  amount: value === "fixed" ? (prev.budget.amount ?? 0) : undefined,
                  hourlyRate:
                    value === "hourly" ? (prev.budget.hourlyRate ?? { min: 0, max: 0 }) : undefined,
                },
              }));
            }}
          >
            <option value="fixed">Fixed</option>
            <option value="hourly">Hourly</option>
          </Select>

          <Input
            label="Duration Estimate"
            value={form.duration?.estimate ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                duration: { ...prev.duration, estimate: e.target.value },
              }))
            }
            placeholder=" 30 in days"
          />
          <Select
            label="Experience Level"
            value={form.experienceLevel}
            onChange={(e) => handleChange("experienceLevel", e.target.value)}
          >
            <option value="entry">Entry</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </Select>
        </div>

        {/* Budget Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-[#134848] mb-3">Budget</h3>
          {form.jobType === "fixed" ? (
            <Input
              label="Fixed Amount"
              type="number"
              value={form.budget.amount ?? ""}
              onChange={(e) => handleBudgetChange("amount", parseFloat(e.target.value))}
              required
            />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Hourly Rate"
                type="number"
                value={form.budget.hourlyRate?.min ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    budget: {
                      ...prev.budget,
                      hourlyRate: {
                        ...prev.budget.hourlyRate!,
                        min: parseFloat(e.target.value),
                      },
                    },
                  }))
                }
                required
              />
              <Input
                label="Max Hourly Rate"
                type="number"
                value={form.budget.hourlyRate?.max ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    budget: {
                      ...prev.budget,
                      hourlyRate: {
                        ...prev.budget.hourlyRate!,
                        max: parseFloat(e.target.value),
                      },
                    },
                  }))
                }
                required
              />
            </div>
          )}
        </div>

        {/* Description with AI Button */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Job Description</label>
            <button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={isGeneratingAI}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={14} className={isGeneratingAI ? "animate-spin" : ""} />
              {isGeneratingAI ? "Generating..." : "Generate with AI"}
            </button>
          </div>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E90EB]"
            rows={4}
            placeholder="Describe the job in detail..."
            required
          />
        </div>

        {/* Skills */}
        <div className="mt-6">
          <Input
            label="Skills Required (comma separated)"
            value={form.skillsRequired?.join(", ") ?? ""}
            onChange={(e) =>
              handleChange(
                "skillsRequired",
                e.target.value.split(",").map((s) => s.trim())
              )
            }
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <div className="w-32">
            <Button text="Cancel" onClick={onClose} />
          </div>
          <div className="w-40">
            <Button text={isEdit ? "Update Job" : "Post Job"} onClick={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
}
