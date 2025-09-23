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
      <p className="text-center py-12 text-gray-500 text-lg animate-pulse">Loading profile...</p>
    );

  if (!profile)
    return <p className="text-center py-12 text-red-500 text-lg">No profile data found.</p>;

  return (
    <>
      <motion.section
        className="bg-white shadow-md rounded-2xl p-6 w-full max-w-3xl mx-auto mt-6 border border-gray-100"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-[#134848] tracking-tight">
            User Profile
          </h2>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Left: Profile Picture */}
          <motion.div className="relative flex-shrink-0 group" whileHover={{ scale: 1.05 }}>
            <img
              src={profile.profilePic || "/default-avatar.png"}
              alt="Profile"
              className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-[#134848] object-cover shadow-md"
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
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h2 className=" text-xl font-semibold text-gray-800">{profile.UserName}</h2>

            <div className="space-y-2 text-gray-700">
              <p className="text-base md:text-lg">
                <span className="font-semibold">Email:</span> {profile.email}
              </p>
              <p className="text-base md:text-lg">
                <span className="font-semibold">Role:</span>{" "}
                <span className="capitalize text-[#2E90EB] font-medium">{profile.role}</span>
              </p>
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
