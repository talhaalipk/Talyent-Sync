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
    <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-3xl mx-auto mt-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Freelancer Profile</h2>

        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Brain size={18} /> Extract Skills
            </button>
          )}

          {showModal && <ExtractSkillsModal onClose={() => setShowModal(false)} />}

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
      </div>

      {/* API response message */}
      {message && <div className="mb-4 text-sm text-center text-green-600">{message}</div>}

      {/* Bio Description */}
      <div className="mt-2">
        <label className="text-sm font-medium text-gray-700">Bio Description</label>
        {isEditing ? (
          <textarea
            className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={4}
            placeholder="Write a short bio about yourself..."
            value={form.bio_desc}
            onChange={(e) => handleChange("bio_desc", e.target.value)}
          />
        ) : form.bio_desc ? (
          <p className="mt-2 text-gray-700 whitespace-pre-line">{form.bio_desc}</p>
        ) : (
          <p className="text-gray-500">No bio added</p>
        )}
      </div>

      {/* Skills */}
      <div className="mt-4">
        <label className="text-sm font-medium text-gray-700">Skills</label>
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
          <div className="flex flex-wrap gap-2 mt-2">
            {form.skills.map((s, i) => (
              <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
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
          <p className="text-gray-700 font-medium">Hourly Rate: ${form.hourlyRate}</p>
        )}
      </div>

      {/* Portfolio */}
      <div className="mt-4">
        <label className="text-sm font-medium text-gray-700">Portfolio</label>
        {isEditing ? (
          <div className="space-y-3 mt-2">
            {form.portfolio.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
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
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addPortfolio}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              + Add Portfolio
            </button>
          </div>
        ) : form.portfolio.length > 0 ? (
          <ul className="list-disc ml-6 text-gray-700 mt-2">
            {form.portfolio.map((item, idx) => (
              <li key={idx}>
                <span className="font-medium">{item.title}:</span>{" "}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
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
        <label className="text-sm font-medium text-gray-700">Certifications</label>
        {isEditing ? (
          <div className="space-y-3 mt-2">
            {form.certifications.map((cert, idx) => (
              <div key={idx} className="flex gap-2 items-center">
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
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addCertification}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              + Add Certification
            </button>
          </div>
        ) : form.certifications.length > 0 ? (
          <ul className="list-disc ml-6 text-gray-700 mt-2">
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
        <label className="text-sm font-medium text-gray-700">Location</label>
        {isEditing ? (
          <Input
            label=""
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Enter your location"
          />
        ) : (
          <p className="text-gray-700 flex items-center gap-2">
            <MapPin size={16} /> {form.location || "No location added"}
          </p>
        )}
      </div>
    </div>
  );
}
