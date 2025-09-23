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
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center p-6">
      {isLoggedIn ? (
        <>
          <ProfileInfo />

          {/* ✅ Conditional render based on role */}
          {profile?.role === "freelancer" && <ProfileDetailsFreelancer profile={profile} />}

          {profile?.role === "client" && <ProfileDetailsClient profile={profile} />}

          <UpdatePassword />
        </>
      ) : (
        <PleaseLogin />
      )}
    </div>
  );
}

export default Profile;
