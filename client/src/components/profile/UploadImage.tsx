import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useUserStore } from "../../store/userStore"; // Adjust path as needed

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (file: File | null) => void;
}

export default function UploadImage({ isOpen, onClose, onUpdate }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Zustand store
  const { uploadProfileImage, uploadingImage } = useUserStore();

  if (!isOpen) return null;

  const handleUpdate = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first!");
      return;
    }

    const loadingToast = toast.loading("Uploading image...");
    const success = await uploadProfileImage(selectedFile);
    toast.dismiss(loadingToast);

    if (success) {
      toast.success("Image uploaded successfully!");
      setTimeout(() => {
        onClose();
        setSelectedFile(null);
      }, 1200);
    } else {
      toast.error("Upload failed. Please try again.");
    }

    onUpdate(selectedFile);
  };

  const handleClose = () => {
    onClose();
    setSelectedFile(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative border border-gray-100"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold transition"
          disabled={uploadingImage}
        >
          ✕
        </button>

        <h2 className="text-2xl md:text-3xl font-bold text-[#134848] mb-6 text-center">
          Update Profile Picture
        </h2>

        <div className="flex flex-col space-y-5">
          {/* Drop area style */}
          <label className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-[#2E90EB] hover:bg-[#F9FAFB] transition">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
              disabled={uploadingImage}
            />
            <p className="text-gray-500 text-sm">Drag & drop or click to select an image</p>
          </label>

          {/* File preview */}
          {selectedFile && (
            <div className="bg-[#F9FAFB] p-4 rounded-xl text-center border border-gray-200">
              <p className="font-medium text-gray-700">Selected File</p>
              <p className="text-sm text-gray-500 mt-1">{selectedFile.name}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition disabled:opacity-50"
              disabled={uploadingImage}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-6 py-2.5 rounded-xl bg-[#2E90EB] text-white font-semibold hover:bg-blue-500 shadow-md hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                "Update Image"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
