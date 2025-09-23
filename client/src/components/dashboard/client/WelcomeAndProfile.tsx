// src/components/dashboard/WelcomeAndProfile.tsx
import { useUserStore } from "../../../store/userStore";

export default function WelcomeAndProfile() {
  const { profile } = useUserStore();

  if (!profile) return null;

  const { clientProfile, profilePic, UserName, email, role } = profile;

  return (
    <section className="bg-white shadow-md rounded-2xl p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Side: Picture + Basic Info */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/3">
          <img
            src={profilePic}
            alt={UserName}
            className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-[#2E90EB] mb-4"
          />

          <div className="space-y-2 text-center md:text-left">
            <DetailLine label="Username" value={UserName} />
            <DetailLine label="Email" value={email} />
            <DetailLine label="Role" value={role} />
          </div>
        </div>

        {/* Right Side: Client Details */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailCard label="Company Name" value={clientProfile?.companyName} />
          <DetailCard
            label="Average Budget"
            value={clientProfile?.budget ? `$${clientProfile.budget}` : "—"}
          />
          <DetailCard label="Location" value={clientProfile?.location} />

          {/* Full-width description */}
          {clientProfile?.companyDescription && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-[#134848] mb-1">Company Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed bg-[#F9FAFB] p-3 rounded-lg border border-gray-200">
                {clientProfile.companyDescription}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* Reusable small card */
function DetailCard({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="bg-[#F9FAFB] p-4 rounded-lg border border-gray-200 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
    </div>
  );
}

/* Smaller line detail for left column */
function DetailLine({ label, value }: { label: string; value?: string }) {
  return (
    <p className="text-sm text-gray-700">
      <span className="font-semibold">{label}: </span>
      {value || "—"}
    </p>
  );
}
