import { useState } from "react";
import { Edit, Save, MapPin, Building2, Wallet } from "lucide-react";
import Input from "../../ui/Input";
import type { User } from "../../store/userStore";
import { useUserStore } from "../../store/userStore";
import { toast } from "react-hot-toast"; // ya jo bhi toaster use kar rahe ho

export default function ProfileDetailsClient({ profile }: { profile: User }) {
  const [isEditing, setIsEditing] = useState(false);
  const { updateClientProfile } = useUserStore();

  const [form, setForm] = useState({
    location: profile?.clientProfile?.location || "Please Add Location",
    companyName: profile?.clientProfile?.companyName || "Please Add Company Name",
    budget: profile?.clientProfile?.budget || 0,
    companyDescription:
      profile?.clientProfile?.companyDescription || "Please Add Company Description",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // 🔹 Check if data actually changed
    const original = profile.clientProfile || {};
    const hasChanged = Object.keys(form).some(
      (key) => form[key as keyof typeof form] !== original[key as keyof typeof original]
    );

    if (!hasChanged) {
      toast.error("No changes detected!");
      setIsEditing(false);
      return;
    }

    // 🔹 Call API
    const { success, message } = await updateClientProfile(form);
    if (success) {
      toast.success(message || "Profile updated successfully!");
      setIsEditing(false);
    } else {
      toast.error(message || "Failed to update profile");
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-2xl p-6 w-full border border-gray-100">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-[#134848]">Client Profile</h2>
        {isEditing ? (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white shadow-sm transition hover:bg-green-700"
          >
            <Save size={18} /> Save
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-lg bg-[#2E90EB] px-4 py-2 text-white shadow-sm transition hover:brightness-110"
          >
            <Edit size={18} /> Update
          </button>
        )}
      </div>

      {/* Location */}
      <div className="mt-3">
        <label className="text-sm font-medium text-[#1F2937]">Location</label>
        {isEditing ? (
          <Input
            label=""
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Enter location"
          />
        ) : (
          <p className="mt-1 flex items-center gap-2 text-gray-700">
            <MapPin size={16} /> {form.location}
          </p>
        )}
      </div>

      {/* Company Name */}
      <div className="mt-3">
        <label className="text-sm font-medium text-[#1F2937]">Company Name</label>
        {isEditing ? (
          <Input
            label=""
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            placeholder="Enter company name"
          />
        ) : (
          <p className="mt-1 flex items-center gap-2 text-gray-700">
            <Building2 size={16} /> {form.companyName}
          </p>
        )}
      </div>

      {/* Budget */}
      <div className="mt-3">
        <label className="text-sm font-medium text-[#1F2937]">Average Budget</label>
        {isEditing ? (
          <Input
            type="number"
            label=""
            name="budget"
            value={form.budget.toString()}
            onChange={handleChange}
            placeholder="Enter budget"
          />
        ) : (
          <p className="mt-1 flex items-center gap-2 text-gray-700">
            <Wallet size={16} /> ${form.budget}
          </p>
        )}
      </div>

      {/* Company Description */}
      <div className="mt-3">
        <label className="text-sm font-medium text-[#1F2937]">Company Description</label>
        {isEditing ? (
          <textarea
            name="companyDescription"
            value={form.companyDescription}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E90EB]"
            placeholder="Enter description"
          />
        ) : (
          <p className="mt-1 text-gray-700">{form.companyDescription}</p>
        )}
      </div>
    </div>
  );
}
