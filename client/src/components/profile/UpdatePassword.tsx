import { useState } from "react";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { Lock, Save, Edit } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/axiosInstance";

export default function UpdatePassword() {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    // 1) Validation
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (form.oldPassword === form.newPassword) {
      toast.error("New password cannot be same as old password");
      return;
    }

    // 2) API Call
    try {
      setLoading(true);
      const res = await api.put("/profile/change-password", {
        currentPassword: form.oldPassword,
        newPassword: form.newPassword,
      });

      if (res.data.success) {
        toast.success(res.data.message || "Password updated successfully");
        setIsEditing(false);
        setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(res.data.message || "Failed to update password");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Something went wrong! Try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-[#134848]">
          <Lock size={20} /> Update Password
        </h2>

        {isEditing ? (
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            <Save size={18} /> {loading ? "Saving..." : "Save"}
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-lg bg-[#2E90EB] px-4 py-2 text-white transition hover:brightness-110"
          >
            <Edit size={18} /> Update
          </button>
        )}
      </div>

      {/* Form Layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column - Old Password */}
        <div>
          <Input
            label="Enter Existing Password"
            type="password"
            name="oldPassword"
            value={form.oldPassword}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="Enter your current password"
          />
        </div>

        {/* Right Column - New Password + Confirm */}
        <div className="flex flex-col gap-4">
          <Input
            label="Enter New Password"
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="Enter new password"
          />
          <Input
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="Confirm new password"
          />
        </div>
      </div>

      {/* Bottom Button */}
      {isEditing && (
        <div className="mt-6">
          <Button
            text={loading ? "Updating..." : "Update Password"}
            onClick={handleUpdate}
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
}
