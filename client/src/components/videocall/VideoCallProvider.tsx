// src/components/videocall/VideoCallProvider.tsx
import { useEffect } from 'react';
import { useVideoCallStore } from '../../store/videoCallStore';
import { useAuthStore } from '../../store/authStore';
import IncomingCallModal from './IncomingCallModal';

interface VideoCallProviderProps {
  children: React.ReactNode;
}

const VideoCallProvider = ({ children }: VideoCallProviderProps) => {
  const { user } = useAuthStore();
  const { connect, disconnect, isConnected } = useVideoCallStore();

  console.log('🎥 Video call provider mounted, user:', user?._id);

  useEffect(() => {
    if (user && !isConnected) {
      console.log('🔌 Connecting to video call service...');
      connect();
    }

    return () => {
      if (isConnected) {
        console.log('🔌 Disconnecting from video call service...');
        disconnect();
      }
    };
  }, [user, connect, disconnect, isConnected]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Video call provider cleanup');
      disconnect();
    };
  }, [disconnect]);

  return (
    <>
      {children}
      <IncomingCallModal />
    </>
  );
};

export default VideoCallProvider;