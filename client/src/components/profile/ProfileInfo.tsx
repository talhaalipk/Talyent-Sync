import { useUserStore } from "../../store/userStore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import UploadImage from "./UploadImage";

function ProfileInfo() {
  const { profile, fetchProfile, loading } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading)
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-center text-gray-500 text-sm animate-pulse">Loading profile...</p>
      </div>
    );

  if (!profile)
    return <p className="text-center py-12 text-red-500 text-lg">No profile data found.</p>;

  return (
    <>
      <motion.section
        className=" rounded-2xl p-6 w-full border border-gray-100 sticky top-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Content */}
        <div className="flex flex-col gap-6">
          {/* Left: Profile Picture */}
          <motion.div className="relative mx-auto" whileHover={{ scale: 1.03 }}>
            <img
              src={profile.profilePic || "/default-avatar.png"}
              alt="Profile"
              className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white object-cover shadow-md ring-2 ring-[#134848]"
            />

            {/* + Overlay Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute bottom-1 right-1 bg-[#2E90EB] text-white w-9 h-9 rounded-full flex items-center justify-center border-2 border-white shadow-md hover:bg-blue-600 hover:scale-110 transition-all duration-200 text-2xl font-bold"
            >
              +
            </button>
          </motion.div>

          {/* Right: Info */}
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-[#134848] tracking-tight">
              {profile.UserName}
            </h2>
            <p className="mt-1 text-sm text-gray-600">{profile.email}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#F9FAFB] px-3 py-1 text-xs font-medium text-[#1F2937] ring-1 ring-gray-200">
              <span className="h-2 w-2 rounded-full bg-[#2E90EB]"></span>
              <span className="capitalize">{profile.role}</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Upload Image Modal */}
      <UploadImage
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={(file) => {
          console.log("Selected file:", file);
          setIsModalOpen(false);
          // Next step: API call and update preview
        }}
      />
    </>
  );
}

export default ProfileInfo;
