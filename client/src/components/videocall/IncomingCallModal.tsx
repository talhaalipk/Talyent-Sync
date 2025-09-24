// src/components/videocall/IncomingCallModal.tsx
import { Phone, PhoneOff, User } from 'lucide-react';
import { useVideoCallStore } from '../../store/videoCallStore';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-pulse">
        {/* Caller Info */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            {incomingCall.callerProfilePic ? (
              <img
                src={incomingCall.callerProfilePic}
                alt={incomingCall.callerName}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 animate-pulse"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#134848] flex items-center justify-center border-4 border-blue-500 animate-pulse">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            {/* Pulsing ring effect */}
            <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-blue-400 animate-ping"></div>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {incomingCall.callerName}
          </h3>
          <p className="text-gray-600 text-lg">is calling you...</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-8">
          {/* Reject Button */}
          <button
            onClick={handleReject}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </button>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg animate-bounce"
          >
            <Phone className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* Call info */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Tap to accept or decline the video call
          </p>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;