// src/components/videocall/VideoCallButton.tsx
import { Video, VideoOff } from "lucide-react";
import { useVideoCallStore } from "../../store/videoCallStore";
import { useNavigate } from "react-router-dom";

interface VideoCallButtonProps {
  targetUserId: string;
  targetUserName: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost";
}

const VideoCallButton = ({
  targetUserId,
  targetUserName,
  disabled = false,
  size = "md",
  variant = "primary",
}: VideoCallButtonProps) => {
  const { initiateCall, onlineUsers, isConnected } = useVideoCallStore();
  const navigate = useNavigate();

  console.log("🎥 Video call button for:", targetUserName, targetUserId);

  const targetUser = onlineUsers.find((user) => user.userId === targetUserId);
  const isTargetOnline = !!targetUser;
  const isTargetOnCall = targetUser?.isOnCall || false;

  console.log("👤 Target user status:", { isTargetOnline, isTargetOnCall });

  const handleVideoCall = () => {
    if (!isConnected) {
      console.log("❌ Not connected to video call socket");
      alert("Video calling service is not available");
      return;
    }

    if (!isTargetOnline) {
      console.log("❌ Target user is not online");
      alert(`${targetUserName} is not online`);
      return;
    }

    if (isTargetOnCall) {
      console.log("❌ Target user is already on a call");
      alert(`${targetUserName} is already on a call`);
      return;
    }

    console.log("📞 Initiating video call to:", targetUserName);
    const roomId = initiateCall(targetUserId, targetUserName) as unknown as string | undefined;
    if (roomId) {
      navigate(`/videocall/${roomId}`);
    }
  };

  const isDisabled = disabled || !isConnected || !isTargetOnline || isTargetOnCall;

  // Size classes
  const sizeClasses = {
    sm: "w-8 h-8 p-1.5",
    md: "w-10 h-10 p-2",
    lg: "w-12 h-12 p-2.5",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Variant classes
  const variantClasses = {
    primary: isDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-[#2E90EB] hover:bg-blue-600",
    secondary: isDisabled
      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300",
    ghost: isDisabled ? "text-gray-400 cursor-not-allowed" : "text-[#2E90EB] hover:bg-blue-50",
  };

  const getTooltipText = () => {
    if (!isConnected) return "Video calling service unavailable";
    if (!isTargetOnline) return `${targetUserName} is offline`;
    if (isTargetOnCall) return `${targetUserName} is on another call`;
    return `Start video call with ${targetUserName}`;
  };

  return (
    <div className="relative group">
      <button
        onClick={handleVideoCall}
        disabled={isDisabled}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          rounded-full
          flex items-center justify-center
          transition-all duration-200
          ${!isDisabled && "hover:scale-105 shadow-lg"}
        `}
        title={getTooltipText()}
      >
        {isDisabled && !isTargetOnline ? (
          <VideoOff className={`${iconSizes[size]} ${variant === "primary" ? "text-white" : ""}`} />
        ) : (
          <Video className={`${iconSizes[size]} ${variant === "primary" ? "text-white" : ""}`} />
        )}
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
          {getTooltipText()}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>

      {/* Online indicator */}
      {isTargetOnline && !isTargetOnCall && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}

      {/* On call indicator */}
      {isTargetOnCall && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

export default VideoCallButton;
