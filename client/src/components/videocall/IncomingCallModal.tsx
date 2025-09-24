// src/components/videocall/IncomingCallModal.tsx
import { Phone, PhoneOff, User } from 'lucide-react';
import { useVideoCallStore } from '../../store/videoCallStore';
import { motion, AnimatePresence } from 'framer-motion';

const IncomingCallModal = () => {
  const { incomingCall, acceptCall, rejectCall } = useVideoCallStore();

  console.log('🎯 Incoming call modal render:', incomingCall);

  if (!incomingCall) return null;

  const handleAccept = () => {
    console.log('✅ User accepted call');
    acceptCall();
  };

  const handleReject = () => {
    console.log('❌ User rejected call');
    rejectCall();
  };

  return (
    <AnimatePresence>
      {incomingCall && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed top-6 right-6 z-50 w-full max-w-md"
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex items-center p-4">
            {/* Avatar */}
            {incomingCall.callerProfilePic ? (
              <img
                src={incomingCall.callerProfilePic}
                alt={incomingCall.callerName}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#2E90EB]"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#134848] flex items-center justify-center border-2 border-[#2E90EB]">
                <User className="w-7 h-7 text-white" />
              </div>
            )}

            {/* Caller Info */}
            <div className="flex-1 ml-4">
              <h3 className="text-base font-semibold text-gray-900">
                {incomingCall.callerName}
              </h3>
              <p className="text-sm text-gray-500">is calling you…</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleReject}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 transition-transform transform hover:scale-110 shadow-md"
              >
                <PhoneOff className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleAccept}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 transition-transform transform hover:scale-110 shadow-md animate-bounce"
              >
                <Phone className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IncomingCallModal;
