// src/components/videocall/VideoCallProvider.tsx
import { useEffect, useRef } from "react";
import { useVideoCallStore } from "../../store/videoCallStore";
import { useAuthStore } from "../../store/authStore";
import IncomingCallModal from "./IncomingCallModal";

interface VideoCallProviderProps {
  children: React.ReactNode;
}

const VideoCallProvider = ({ children }: VideoCallProviderProps) => {
  const { user } = useAuthStore();
  const { connect, isConnected } = useVideoCallStore();
  const hasConnected = useRef(false);

  console.log("🎥 Video call provider mounted, user:", user?._id, "isConnected:", isConnected);

  useEffect(() => {
    // Only connect if we have a user and haven't connected yet
    if (user && !isConnected && !hasConnected.current) {
      console.log("🔌 Connecting to video call service...");
      hasConnected.current = true;
      connect();
    }
    
    // Reset flag if user logs out
    if (!user && hasConnected.current) {
      hasConnected.current = false;
    }
  }, [user, connect, isConnected]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      console.log("🧹 Video call provider unmounting");
      hasConnected.current = false;
    };
  }, []); // Empty dependency array for unmount only

  return (
    <>
      {children}
      <IncomingCallModal />
    </>
  );
};

export default VideoCallProvider;

// // src/components/videocall/VideoCallProvider.tsx
// import { useEffect } from "react";
// import { useVideoCallStore } from "../../store/videoCallStore";
// import { useAuthStore } from "../../store/authStore";
// import IncomingCallModal from "./IncomingCallModal";

// interface VideoCallProviderProps {
//   children: React.ReactNode;
// }

// const VideoCallProvider = ({ children }: VideoCallProviderProps) => {
//   const { user } = useAuthStore();
//   const { connect, isConnected } = useVideoCallStore();

//   console.log("🎥 Video call provider mounted, user:", user?._id);

//   useEffect(() => {
//     if (user && !isConnected) {
//       console.log("🔌 Connecting to video call service...");
//       connect();
//     }

//     return () => {
//       // Unsubscribe socket listeners on unmount; keep connection lifecycle internal
//       console.log("🔌 Cleaning up video call provider effect");
//     };
//   }, [user, connect, isConnected]);

//   // Clean up on unmount
//   useEffect(() => {
//     return () => {
//       console.log("🧹 Video call provider cleanup");
//     };
//   }, []);

//   return (
//     <>
//       {children}
//       <IncomingCallModal />
//     </>
//   );
// };

// export default VideoCallProvider;
