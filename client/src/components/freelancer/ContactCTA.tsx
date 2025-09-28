import React from "react";

interface ContactCTAProps {
  freelancerName: string;
  onContactClick?: () => void;
}

const ContactCTA: React.FC<ContactCTAProps> = ({ freelancerName, onContactClick }) => {
  const handleContact = () => {
    if (onContactClick) {
      onContactClick();
    } else {
      // Default behavior - you can customize this based on your needs
      alert(`Contact functionality to be implemented for ${freelancerName}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#134848] to-[#2E90EB] rounded-xl shadow-lg p-6 text-white">
      <h3 className="font-bold text-lg mb-2">Ready to work together?</h3>
      <p className="text-sm opacity-90 mb-4">Get in touch to discuss your project requirements.</p>
      <button
        className="w-full bg-white text-[#134848] font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
        onClick={handleContact}
      >
        Contact {freelancerName?.split(" ")[0]}
      </button>
    </div>
  );
};

export default ContactCTA;
