import { useState, useEffect } from "react";
import { Edit, Save, MapPin, Brain } from "lucide-react";
import Input from "../../ui/Input";
import type { User } from "../../store/userStore";
import api from "../../utils/axiosInstance";
import ExtractSkillsModal from "./ExtractSkillsModal";

export default function ProfileDetailsFreelancer({ profile }: { profile: User }) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    bio_desc: profile?.freelancerProfile?.bio_desc || "",
    skills: profile?.freelancerProfile?.skills || [],
    hourlyRate: profile?.freelancerProfile?.hourlyRate || 0,
    portfolio: profile?.freelancerProfile?.portfolio || [], // [{title,url}]
    certifications: profile?.freelancerProfile?.certifications || [], // [{title,issuer,year}]
    location: profile?.freelancerProfile?.location || "",
  });

  useEffect(() => {
    console.log(profile);
  }, [profile]);

  // helpers
  const handleChange = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // portfolio handlers
  const addPortfolio = () => {
    handleChange("portfolio", [...form.portfolio, { title: "", url: "" }]);
  };
  const updatePortfolio = (index: number, field: string, value: string) => {
    const updated = [...form.portfolio];
    updated[index] = { ...updated[index], [field]: value };
    handleChange("portfolio", updated);
  };
  const removePortfolio = (index: number) => {
    handleChange(
      "portfolio",
      form.portfolio.filter((_, i) => i !== index)
    );
  };

  // certification handlers
  const addCertification = () => {
    handleChange("certifications", [...form.certifications, { title: "", issuer: "", year: "" }]);
  };
  const updateCertification = (index: number, field: string, value: string) => {
    const updated = [...form.certifications];
    updated[index] = { ...updated[index], [field]: value };
    handleChange("certifications", updated);
  };
  const removeCertification = (index: number) => {
    handleChange(
      "certifications",
      form.certifications.filter((_, i) => i !== index)
    );
  };

  // save
  const handleSave = async () => {
    try {
      const res = await api.put("/profile/freelancer", form);
      setMessage(res.data.message || "Profile updated!");
      console.log("Updated:", res.data);
      setIsEditing(false);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-2xl p-6 w-full border border-gray-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold text-[#134848] tracking-tight">Freelancer Profile</h2>

        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white shadow-sm transition hover:bg-purple-700"
            >
              <Brain size={18} /> Extract Skills
            </button>
          )}

          {showModal && <ExtractSkillsModal onClose={() => setShowModal(false)} />}

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
      </div>

      {/* API response message */}
      {message && (
        <div className="mb-4 rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-center text-sm text-green-700">
          {message}
        </div>
      )}

      {/* Bio Description */}
      <div className="mt-2">
        <label className="text-sm font-medium text-[#1F2937]">Bio Description</label>
        {isEditing ? (
          <textarea
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E90EB]"
            rows={4}
            placeholder="Write a short bio about yourself..."
            value={form.bio_desc}
            onChange={(e) => handleChange("bio_desc", e.target.value)}
          />
        ) : form.bio_desc ? (
          <p className="mt-2 whitespace-pre-line text-gray-700">{form.bio_desc}</p>
        ) : (
          <p className="text-gray-500">No bio added</p>
        )}
      </div>

      {/* Skills */}
      <div className="mt-4">
        <label className="text-sm font-medium text-[#1F2937]">Skills</label>
        {isEditing ? (
          <Input
            label=""
            placeholder="Enter skills separated by commas"
            value={form.skills.join(", ")}
            onChange={(e) =>
              handleChange(
                "skills",
                e.target.value.split(",").map((s) => s.trim())
              )
            }
          />
        ) : form.skills.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {form.skills.map((s, i) => (
              <span key={i} className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                {s}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No skills</p>
        )}
      </div>

      {/* Hourly Rate */}
      <div className="mt-4">
        {isEditing ? (
          <Input
            label="Hourly Rate ($)"
            type="number"
            value={form.hourlyRate}
            onChange={(e) => handleChange("hourlyRate", Number(e.target.value))}
          />
        ) : (
          <p className="font-medium text-gray-700">Hourly Rate: ${form.hourlyRate}</p>
        )}
      </div>

      {/* Portfolio */}
      <div className="mt-4">
        <label className="text-sm font-medium text-[#1F2937]">Portfolio</label>
        {isEditing ? (
          <div className="mt-2 space-y-3">
            {form.portfolio.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  label=""
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) => updatePortfolio(idx, "title", e.target.value)}
                />
                <Input
                  label=""
                  placeholder="URL"
                  value={item.url}
                  onChange={(e) => updatePortfolio(idx, "url", e.target.value)}
                />
                <button
                  onClick={() => removePortfolio(idx)}
                  className="text-red-500 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addPortfolio}
              className="rounded-lg bg-[#2E90EB] px-3 py-1 text-white transition hover:brightness-110"
            >
              + Add Portfolio
            </button>
          </div>
        ) : form.portfolio.length > 0 ? (
          <ul className="ml-6 mt-2 list-disc text-gray-700">
            {form.portfolio.map((item, idx) => (
              <li key={idx}>
                <span className="font-medium">{item.title}:</span>{" "}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2E90EB] hover:underline"
                >
                  {item.url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No portfolio added</p>
        )}
      </div>

      {/* Certifications */}
      <div className="mt-4">
        <label className="text-sm font-medium text-[#1F2937]">Certifications</label>
        {isEditing ? (
          <div className="mt-2 space-y-3">
            {form.certifications.map((cert, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  label=""
                  placeholder="Title"
                  value={cert.title}
                  onChange={(e) => updateCertification(idx, "title", e.target.value)}
                />
                <Input
                  label=""
                  placeholder="Issuer"
                  value={cert.issuer}
                  onChange={(e) => updateCertification(idx, "issuer", e.target.value)}
                />
                <Input
                  label=""
                  placeholder="Year"
                  value={cert.year}
                  onChange={(e) => updateCertification(idx, "year", e.target.value)}
                />
                <button
                  onClick={() => removeCertification(idx)}
                  className="text-red-500 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addCertification}
              className="rounded-lg bg-[#2E90EB] px-3 py-1 text-white transition hover:brightness-110"
            >
              + Add Certification
            </button>
          </div>
        ) : form.certifications.length > 0 ? (
          <ul className="ml-6 mt-2 list-disc text-gray-700">
            {form.certifications.map((c, idx) => (
              <li key={idx}>
                {c.title} – {c.issuer} ({c.year})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No certifications</p>
        )}
      </div>

      {/* Location */}
      <div className="mt-4">
        <label className="text-sm font-medium text-[#1F2937]">Location</label>
        {isEditing ? (
          <Input
            label=""
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Enter your location"
          />
        ) : (
          <p className="flex items-center gap-2 text-gray-700">
            <MapPin size={16} /> {form.location || "No location added"}
          </p>
        )}
      </div>
    </div>
  );
}
