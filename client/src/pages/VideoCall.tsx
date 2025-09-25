// src/pages/VideoCall.tsx - Fixed version with persistent display
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PhoneOff, Monitor, MonitorOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useVideoCallStore } from "../store/videoCallStore";
import { useAuthStore } from "../store/authStore";

const VideoCall = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    currentCall,
    localStream,
    remoteStream,
    isScreenSharing,
    endCall,
    startScreenShare,
    stopScreenShare,
    isConnected,
  } = useVideoCallStore();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<"connecting" | "connected" | "ended">("connecting");
  const [pageReady, setPageReady] = useState(false);
  const [peerName, setPeerName] = useState<string>("");

  console.log("🎥 Video call page loaded for room:", roomId);
  console.log("📹 Current call state:", currentCall);
  console.log("📡 Local stream:", !!localStream);
  console.log("📡 Remote stream:", !!remoteStream);
  console.log("🔌 Socket connected:", isConnected);
  console.log("👤 User:", user?._id);

  // Initialize page and prevent premature navigation
  useEffect(() => {
    console.log("🚀 Video call page initializing...");

    if (!roomId) {
      console.log("❌ No room ID provided");
      navigate("/chat");
      return;
    }

    // if (!user) {
    //   console.log('❌ No user logged in');
    //   navigate('/login');
    //   return;
    // }

    // Extract peer name from room ID or current call
    if (currentCall) {
      setPeerName(currentCall.peerName);
      console.log("✅ Found peer name from current call:", currentCall.peerName);
    } else {
      // Try to extract from roomId (format: userId1-userId2)
      const parts = roomId.split("-");
      if (parts.length === 2) {
        const otherUserId = parts[0] === user?._id ? parts[1] : parts[0];
        setPeerName(`User ${otherUserId.slice(-4)}`); // Show last 4 chars of ID
        console.log("📝 Generated peer name from room ID:", `User ${otherUserId.slice(-4)}`);
      }
    }

    setPageReady(true);
    console.log("✅ Video call page ready");
  }, [roomId, user, currentCall, navigate]);

  // Set up local video stream
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      console.log("📹 Setting up local video stream");
      localVideoRef.current.srcObject = localStream;

      if (callStatus === "connecting") {
        setCallStatus("connected");
        console.log("📞 Call status updated to connected");
      }
    }
  }, [localStream, callStatus]);

  // Set up remote video stream
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log("📹 Setting up remote video stream");
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Handle call ended event
  useEffect(() => {
    // Listen for call ended and cleanup, but don't navigate immediately
    const handleCallEnded = () => {
      console.log("☎️ Call ended event received");
      setCallStatus("ended");
      // Wait a bit before navigating to show end call message
      setTimeout(() => {
        navigate("/chat");
      }, 2000);
    };

    // You can add call ended listener here if needed
    // This depends on how your store handles call end events

    return () => {
      console.log("🧹 Video call page cleanup");
    };
  }, [navigate]);

  const handleEndCall = () => {
    console.log("☎️ User clicked end call");
    setCallStatus("ended");
    endCall();

    // Navigate after a short delay to show the end call state
    setTimeout(() => {
      navigate("/chat");
    }, 1000);
  };

  const handleScreenShare = async () => {
    console.log("🖥️ User clicked screen share:", isScreenSharing);

    if (isScreenSharing) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  const toggleMute = () => {
    console.log("🎤 Toggling mute:", !isMuted);

    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    console.log("📹 Toggling video:", !isVideoOff);

    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Show loading while page initializes
  if (!pageReady) {
    console.log("⏳ Page not ready yet, showing loading...");
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Initializing video call...</div>
      </div>
    );
  }

  // Show call ended state
  if (callStatus === "ended") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-3xl mb-4">📞</div>
          <div className="text-xl mb-2">Call Ended</div>
          <div className="text-gray-400">Returning to chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden h-[calc(100vh-4rem)] bg-gradient-to-b from-[#0b2f2f] via-[#0f3f3f] to-[#134848]">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="mx-auto max-w-7xl px-4 pt-3">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3 shadow-sm">
            <div className="text-white">
              <h2 className="text-xl font-bold tracking-tight">Video Call</h2>
              <p className="text-xs text-white/70">
                {callStatus === "connecting" ? "Connecting..." : `with ${peerName || "Unknown"}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full shadow ${callStatus === "connected" ? "bg-[#10B981] shadow-[#10B981]/40" : "bg-[#2E90EB] shadow-[#2E90EB]/40"}`}></div>
              <span className="text-xs text-white/80 capitalize">{callStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Stage */}
      <div className="h-full pt-20 pb-28">
        <div className="mx-auto h-full max-w-7xl px-4">
          <div className="relative grid h-full grid-cols-1 rounded-2xl border border-white/10 bg-black/30 shadow-md backdrop-blur-xl overflow-hidden">
            {/* Remote Video (Main) */}
            <div className="relative h-full w-full">
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-white/10 text-white shadow-inner">
                      <span className="text-4xl font-bold">
                        {peerName ? peerName.charAt(0).toUpperCase() : "?"}
                      </span>
                    </div>
                    <p className="mb-1 text-lg font-semibold text-white">
                      {peerName || "Unknown User"}
                    </p>
                    <p className="text-sm text-[#2E90EB]">
                      {callStatus === "connecting" ? "Connecting..." : "Camera is off"}
                    </p>
                  </div>
                </div>
              )}

              {/* Local Video (PiP) */}
              <div className="absolute right-4 top-24 h-36 w-52 overflow-hidden rounded-xl border border-white/20 bg-black/50 shadow-lg backdrop-blur-md">
                {localStream ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/80">
                    <Video className="h-8 w-8" />
                  </div>
                )}
                {isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <VideoOff className="h-8 w-8 text-gray-300" />
                  </div>
                )}

                {/* You label */}
                <div className="absolute bottom-1 left-1 rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
                  You
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20">
        <div className="mx-auto flex max-w-2xl items-center justify-center">
          <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-white/10 bg-white/10 px-4 py-3 shadow-lg backdrop-blur-xl">
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`group flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
                isMuted ? "bg-[#EF4444] hover:brightness-110" : "bg-white/15 hover:bg-white/25"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <MicOff className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </button>

            {/* Video Toggle Button */}
            <button
              onClick={toggleVideo}
              className={`group flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
                isVideoOff ? "bg-[#EF4444] hover:brightness-110" : "bg-white/15 hover:bg-white/25"
              }`}
              title={isVideoOff ? "Turn camera on" : "Turn camera off"}
            >
              {isVideoOff ? (
                <VideoOff className="h-6 w-6 text-white" />
              ) : (
                <Video className="h-6 w-6 text-white" />
              )}
            </button>

            {/* Screen Share Button */}
            <button
              onClick={handleScreenShare}
              className={`group flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
                isScreenSharing ? "bg-[#2E90EB] hover:brightness-110" : "bg-white/15 hover:bg-white/25"
              }`}
              title={isScreenSharing ? "Stop sharing" : "Share screen"}
            >
              {isScreenSharing ? (
                <MonitorOff className="h-6 w-6 text-white" />
              ) : (
                <Monitor className="h-6 w-6 text-white" />
              )}
            </button>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="ml-1 flex h-14 w-14 items-center justify-center rounded-full bg-[#EF4444] text-white shadow-lg transition-transform duration-200 hover:scale-105"
              title="End call"
            >
              <PhoneOff className="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>

      {/* Screen Share Indicator */}
      {isScreenSharing && (
        <div className="absolute left-4 top-24 rounded-lg bg-[#2E90EB] px-4 py-2 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span className="text-sm font-medium">You're sharing your screen</span>
          </div>
        </div>
      )}

      {/* Connection Status Overlay */}
      {!isConnected && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
          <div className="rounded-xl border border-white/10 bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#2E90EB] border-t-transparent"></div>
            <p className="text-sm text-gray-800">Connecting to video call service...</p>
          </div>
        </div>
      )}

      {/* Debug Info (remove in production) */}
      <div className="absolute left-4 top-4 rounded-md bg-black/60 p-2 text-xs text-white">
        <div>Room: {roomId}</div>
        <div>Connected: {isConnected ? "Yes" : "No"}</div>
        <div>Local Stream: {localStream ? "Yes" : "No"}</div>
        <div>Remote Stream: {remoteStream ? "Yes" : "No"}</div>
        <div>Current Call: {currentCall ? "Yes" : "No"}</div>
        <div>Status: {callStatus}</div>
      </div>
    </div>
  );
};

export default VideoCall;
