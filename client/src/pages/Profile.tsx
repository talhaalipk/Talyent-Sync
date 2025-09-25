import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "../store/userStore";
import ProfileInfo from "../components/profile/ProfileInfo";
import PleaseLogin from "../components/PleaseLogin";
import ProfileDetailsFreelancer from "../components/profile/ProfileDetailsFreelancer";
import ProfileDetailsClient from "../components/profile/ProfileDetailsClient";
import UpdatePassword from "../components/profile/UpdatePassword";

function Profile() {
  const { isLoggedIn, verifylogin } = useAuthStore();
  const { fetchProfile, profile } = useUserStore();

  useEffect(() => {
    verifylogin().then((ok) => {
      if (ok) fetchProfile();
    });
  }, [verifylogin, fetchProfile]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {isLoggedIn ? (
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[#134848] tracking-tight">
              My Profile
            </h1>
            <p className="text-sm text-gray-600">Manage your account information and security</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px,1fr]">
            {/* Left column: Profile summary */}
            <div className="space-y-6">
              <ProfileInfo />
            </div>

            {/* Right column: Details + Security */}
            <div className="space-y-6">
              {/* ✅ Conditional render based on role */}
              {profile?.role === "freelancer" && <ProfileDetailsFreelancer profile={profile} />}

              {profile?.role === "client" && <ProfileDetailsClient profile={profile} />}

              <UpdatePassword />
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-10">
          <PleaseLogin />
        </div>
      )}
    </div>
  );
}

export default Profile;
