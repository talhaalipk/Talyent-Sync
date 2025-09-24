// src/pages/VideoCall.tsx - Fixed version with persistent display
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PhoneOff, Monitor, MonitorOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useVideoCallStore } from '../store/videoCallStore';
import { useAuthStore } from '../store/authStore';

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
    isConnected
  } = useVideoCallStore();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [pageReady, setPageReady] = useState(false);
  const [peerName, setPeerName] = useState<string>('');

  console.log('🎥 Video call page loaded for room:', roomId);
  console.log('📹 Current call state:', currentCall);
  console.log('📡 Local stream:', !!localStream);
  console.log('📡 Remote stream:', !!remoteStream);
  console.log('🔌 Socket connected:', isConnected);
  console.log('👤 User:', user?._id);

  // Initialize page and prevent premature navigation
  useEffect(() => {
    console.log('🚀 Video call page initializing...');
    
    if (!roomId) {
      console.log('❌ No room ID provided');
      navigate('/chat');
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
      console.log('✅ Found peer name from current call:', currentCall.peerName);
    } else {
      // Try to extract from roomId (format: userId1-userId2)
      const parts = roomId.split('-');
      if (parts.length === 2) {
        const otherUserId = parts[0] === user?._id ? parts[1] : parts[0];
        setPeerName(`User ${otherUserId.slice(-4)}`); // Show last 4 chars of ID
        console.log('📝 Generated peer name from room ID:', `User ${otherUserId.slice(-4)}`);
      }
    }

    setPageReady(true);
    console.log('✅ Video call page ready');
  }, [roomId, user, currentCall, navigate]);

  // Set up local video stream
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      console.log('📹 Setting up local video stream');
      localVideoRef.current.srcObject = localStream;
      
      if (callStatus === 'connecting') {
        setCallStatus('connected');
        console.log('📞 Call status updated to connected');
      }
    }
  }, [localStream, callStatus]);

  // Set up remote video stream
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log('📹 Setting up remote video stream');
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Handle call ended event
  useEffect(() => {
    // Listen for call ended and cleanup, but don't navigate immediately
    const handleCallEnded = () => {
      console.log('☎️ Call ended event received');
      setCallStatus('ended');
      // Wait a bit before navigating to show end call message
      setTimeout(() => {
        navigate('/chat');
      }, 2000);
    };

    // You can add call ended listener here if needed
    // This depends on how your store handles call end events

    return () => {
      console.log('🧹 Video call page cleanup');
    };
  }, [navigate]);

  const handleEndCall = () => {
    console.log('☎️ User clicked end call');
    setCallStatus('ended');
    endCall();
    
    // Navigate after a short delay to show the end call state
    setTimeout(() => {
      navigate('/chat');
    }, 1000);
  };

  const handleScreenShare = async () => {
    console.log('🖥️ User clicked screen share:', isScreenSharing);
    
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  const toggleMute = () => {
    console.log('🎤 Toggling mute:', !isMuted);
    
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    console.log('📹 Toggling video:', !isVideoOff);
    
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Show loading while page initializes
  if (!pageReady) {
    console.log('⏳ Page not ready yet, showing loading...');
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Initializing video call...</div>
      </div>
    );
  }

  // Show call ended state
  if (callStatus === 'ended') {
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
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="text-white">
            <h2 className="text-lg font-semibold">Video Call</h2>
            <p className="text-sm text-gray-300">
              {callStatus === 'connecting' ? 'Connecting...' : `with ${peerName || 'Unknown'}`}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              callStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm text-white capitalize">{callStatus}</span>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex h-screen">
        {/* Remote Video (Main) */}
        <div className="flex-1 relative bg-gray-800">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-bold">
                    {peerName ? peerName.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <p className="text-xl font-semibold mb-2">{peerName || 'Unknown User'}</p>
                <p className="text-gray-400">
                  {callStatus === 'connecting' ? 'Connecting...' : 'Camera is off'}
                </p>
              </div>
            </div>
          )}

          {/* Local Video (PiP) */}
          <div className="absolute top-20 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 shadow-lg">
            {localStream ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <Video className="w-8 h-8" />
              </div>
            )}
            {isVideoOff && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-gray-400" />
              </div>
            )}
            
            {/* You label */}
            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              You
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-6 p-6">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Video Toggle Button */}
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
              isVideoOff 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
          >
            {isVideoOff ? (
              <VideoOff className="w-6 h-6 text-white" />
            ) : (
              <Video className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Screen Share Button */}
          <button
            onClick={handleScreenShare}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
              isScreenSharing 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            {isScreenSharing ? (
              <MonitorOff className="w-6 h-6 text-white" />
            ) : (
              <Monitor className="w-6 h-6 text-white" />
            )}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg"
            title="End call"
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>

      {/* Screen Share Indicator */}
      {isScreenSharing && (
        <div className="absolute top-20 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <Monitor className="w-4 h-4" />
            <span className="text-sm font-medium">You're sharing your screen</span>
          </div>
        </div>
      )}

      {/* Connection Status Overlay */}
      {!isConnected && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-800">Connecting to video call service...</p>
          </div>
        </div>
      )}

      {/* Debug Info (remove in production) */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
        <div>Room: {roomId}</div>
        <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
        <div>Local Stream: {localStream ? 'Yes' : 'No'}</div>
        <div>Remote Stream: {remoteStream ? 'Yes' : 'No'}</div>
        <div>Current Call: {currentCall ? 'Yes' : 'No'}</div>
        <div>Status: {callStatus}</div>
      </div>
    </div>
  );
};

export default VideoCall;