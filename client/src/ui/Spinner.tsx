import { motion } from "framer-motion";

export default function Spinner() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-white">
      <motion.div
        className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
    </div>
  );
}
