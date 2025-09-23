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
    <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-3xl mx-auto mt-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#134848]">Client Profile</h2>
        {isEditing ? (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Save size={18} /> Save
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit size={18} /> Update
          </button>
        )}
      </div>

      {/* Location */}
      <div className="mt-3">
        <label className="text-sm font-medium text-gray-700">Location</label>
        {isEditing ? (
          <Input
            label=""
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Enter location"
          />
        ) : (
          <p className="text-gray-700 flex items-center gap-2 mt-1">
            <MapPin size={16} /> {form.location}
          </p>
        )}
      </div>

      {/* Company Name */}
      <div className="mt-3">
        <label className="text-sm font-medium text-gray-700">Company Name</label>
        {isEditing ? (
          <Input
            label=""
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            placeholder="Enter company name"
          />
        ) : (
          <p className="text-gray-700 flex items-center gap-2 mt-1">
            <Building2 size={16} /> {form.companyName}
          </p>
        )}
      </div>

      {/* Budget */}
      <div className="mt-3">
        <label className="text-sm font-medium text-gray-700">Average Budget</label>
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
          <p className="text-gray-700 flex items-center gap-2 mt-1">
            <Wallet size={16} /> ${form.budget}
          </p>
        )}
      </div>

      {/* Company Description */}
      <div className="mt-3">
        <label className="text-sm font-medium text-gray-700">Company Description</label>
        {isEditing ? (
          <textarea
            name="companyDescription"
            value={form.companyDescription}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E90EB]"
            placeholder="Enter description"
          />
        ) : (
          <p className="text-gray-700 mt-1">{form.companyDescription}</p>
        )}
      </div>
    </div>
  );
}
