// src/store/videoCallStore.ts
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './authStore';

interface OnlineUser {
    userId: string;
    userName: string;
    profilePic: string;
    isOnCall: boolean;
}

interface IncomingCall {
    callerId: string;
    callerName: string;
    callerProfilePic: string;
    roomId: string;
}

interface VideoCallStore {
    // Connection
    socket: Socket | null;
    isConnected: boolean;

    // Users
    onlineUsers: OnlineUser[];

    // Call States
    incomingCall: IncomingCall | null;
    currentCall: {
        roomId: string;
        peerId: string;
        peerName: string;
        isActive: boolean;
    } | null;

    // WebRTC
    peerConnection: RTCPeerConnection | null;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isScreenSharing: boolean;
    screenStream: MediaStream | null;
    isSettingUp: boolean;
    lastSignalContext: { peerId: string; roomId: string } | null;

    // Actions
    connect: () => void;
    disconnect: () => void;
    initiateCall: (targetUserId: string, targetUserName: string) => string | undefined;
    acceptCall: () => string | undefined;
    rejectCall: () => void;
    endCall: () => void;
    startScreenShare: () => Promise<void>;
    stopScreenShare: () => void;

    // Setters
    setIncomingCall: (call: IncomingCall | null) => void;
    setCurrentCall: (call: any) => void;
    setLocalStream: (stream: MediaStream | null) => void;
    setRemoteStream: (stream: MediaStream | null) => void;
    setOnlineUsers: (users: OnlineUser[]) => void;
    setupWebRTC: (callData: any) => Promise<void>;
    handleWebRTCOffer: (data: any) => Promise<void>;
    handleWebRTCAnswer: (data: any) => Promise<void>;
    handleWebRTCIceCandidate: (data: any) => Promise<void>;
    cleanupCall: () => void;
}

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' },
    ],
};

export const useVideoCallStore = create<VideoCallStore>((set, get) => ({
    socket: null,
    isConnected: false,
    onlineUsers: [],
    incomingCall: null,
    currentCall: null,
    peerConnection: null,
    localStream: null,
    remoteStream: null,
    isScreenSharing: false,
    screenStream: null,
    isSettingUp: false,
    lastSignalContext: null,

    connect: () => {
        console.log('🔌 Connecting to video call socket...');

        const { user } = useAuthStore.getState();
        if (!user) {
            console.log('❌ No user found for video call connection');
            return;
        }

        // Get token from cookies
        const socket = io('http://localhost:5000/videocall', {
            withCredentials: true, // This ensures cookies are sent with the request
            transports: ['websocket', 'polling'] // Allow fallback to polling if websocket fails
        });

        socket.on('connect', () => {
            console.log('✅ Video call socket connected');
            set({ isConnected: true });
        });

        socket.on('disconnect', () => {
            console.log('🔌 Video call socket disconnected');
            set({ isConnected: false });
        });

        socket.on('online-users-updated', (data: { users: OnlineUser[] }) => {
            console.log('👥 Online users updated:', data.users.length);
            set({ onlineUsers: data.users });
        });

        socket.on('incoming-call', (data: IncomingCall) => {
            console.log('📞 Incoming call from:', data.callerName);
            set({ incomingCall: data });
        });

        socket.on('call-accepted', (data: any) => {
            console.log('✅ Call accepted, starting WebRTC...');
            // For the caller, set currentCall so ICE and UI work correctly
            set({
                currentCall: {
                    roomId: data.roomId,
                    peerId: data.receiverId,
                    peerName: data.receiverName,
                    isActive: true
                }
            });
            get().setupWebRTC(data);
        });

        socket.on('call-rejected', (data: any) => {
            console.log('❌ Call rejected by:', data.rejectedBy);
            alert(`Call rejected by ${data.rejectedBy}`);
            set({ incomingCall: null, currentCall: null });
        });

        socket.on('call-started', (data: any) => {
            console.log('🎥 Call started with:', data.peerName);
            set({
                currentCall: {
                    roomId: data.roomId,
                    peerId: data.peerId,
                    peerName: data.peerName,
                    isActive: true
                },
                incomingCall: null
            });
            get().setupWebRTC(data);
        });

        socket.on('call-ended', (data: any) => {
            console.log('☎️ Call ended by:', data.endedBy);
            get().cleanupCall();
        });

        socket.on('call-error', (data: any) => {
            console.log('❌ Call error:', data.message);
            alert(`Call error: ${data.message}`);
        });

        // WebRTC signaling events
        socket.on('webrtc-offer', get().handleWebRTCOffer);
        socket.on('webrtc-answer', get().handleWebRTCAnswer);
        socket.on('webrtc-ice-candidate', get().handleWebRTCIceCandidate);
        socket.on('peer-screen-share-start', () => {
            console.log('🖥️ Peer started screen sharing');
        });
        socket.on('peer-screen-share-stop', () => {
            console.log('🖥️ Peer stopped screen sharing');
        });

        set({ socket });
    },

    disconnect: () => {
        console.log('🔌 Disconnecting video call socket...');
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, isConnected: false, onlineUsers: [] });
        }
    },

    initiateCall: (targetUserId: string, targetUserName: string) => {
        console.log(`📞 Initiating call to: ${targetUserName} (${targetUserId})`);

        const { socket } = get();
        const { user } = useAuthStore.getState();

        if (!socket || !user) return;

        const roomId = `${user._id}-${targetUserId}`;

        socket.emit('initiate-call', { targetUserId, roomId });
        
        // Return roomId so caller component can navigate without full reload
        return roomId;
    },

    acceptCall: () => {
        console.log('✅ Accepting call...');

        const { socket, incomingCall } = get();
        if (!socket || !incomingCall) return;

        socket.emit('call-response', {
            accepted: true,
            callerId: incomingCall.callerId,
            roomId: incomingCall.roomId
        });
        
        // Return roomId so receiver component can navigate without full reload
        return incomingCall.roomId;
    },

    rejectCall: () => {
        console.log('❌ Rejecting call...');

        const { socket, incomingCall } = get();
        if (!socket || !incomingCall) return;

        socket.emit('call-response', {
            accepted: false,
            callerId: incomingCall.callerId,
            roomId: incomingCall.roomId
        });

        set({ incomingCall: null });
    },

    endCall: () => {
        console.log('☎️ Ending call...');

        const { socket, currentCall } = get();
        if (!socket || !currentCall) return;

        socket.emit('end-call', { roomId: currentCall.roomId });
        get().cleanupCall();
        // Let the UI decide navigation to avoid hard reloads
    },

    startScreenShare: async () => {
        console.log('🖥️ Starting screen share...');

        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            const { peerConnection, socket, currentCall } = get();

            if (peerConnection && screenStream) {
                // Replace video track with screen share
                const videoTrack = screenStream.getVideoTracks()[0];
                const sender = peerConnection.getSenders().find(
                    s => s.track && s.track.kind === 'video'
                );

                if (sender && videoTrack) {
                    await sender.replaceTrack(videoTrack);
                }

                // Handle screen share ending
                videoTrack.onended = () => {
                    console.log('🖥️ Screen share ended');
                    get().stopScreenShare();
                };

                set({ screenStream, isScreenSharing: true });

                // Notify peer
                if (socket && currentCall) {
                    socket.emit('screen-share-start', {
                        roomId: currentCall.roomId,
                        targetUserId: currentCall.peerId
                    });
                }
            }
        } catch (error) {
            console.error('❌ Error starting screen share:', error);
        }
    },

    stopScreenShare: async () => {
        console.log('🖥️ Stopping screen share...');

        const { screenStream, localStream, peerConnection, socket, currentCall } = get();

        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
        }

        if (peerConnection && localStream) {
            // Replace screen share track back to camera
            const videoTrack = localStream.getVideoTracks()[0];
            const sender = peerConnection.getSenders().find(
                s => s.track && s.track.kind === 'video'
            );

            if (sender && videoTrack) {
                await sender.replaceTrack(videoTrack);
            }
        }

        set({ screenStream: null, isScreenSharing: false });

        // Notify peer
        if (socket && currentCall) {
            socket.emit('screen-share-stop', {
                roomId: currentCall.roomId,
                targetUserId: currentCall.peerId
            });
        }
    },

    setupWebRTC: async (callData: any) => {
        console.log('🔄 Setting up WebRTC connection...');

        if (get().isSettingUp) {
            console.log('⏳ WebRTC setup already in progress, skipping duplicate call');
            return;
        }

        set({ isSettingUp: true });

        try {
            // Reuse existing local stream if available
            let existingLocalStream = get().localStream;
            let hadLocalTracks = false;
            if (!existingLocalStream) {
                try {
                    existingLocalStream = await navigator.mediaDevices.getUserMedia({
                        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
                        audio: { echoCancellation: true, noiseSuppression: true }
                    });
                    hadLocalTracks = true;
                } catch (err: any) {
                    if (err && err.name === 'NotReadableError') {
                        console.warn('⚠️ NotReadableError on getUserMedia, proceeding without local tracks (recvonly)');
                        // proceed without local stream; we'll still set up PC to receive remote
                        existingLocalStream = null;
                    } else {
                        throw err;
                    }
                }
                if (existingLocalStream) {
                    console.log('✅ Local stream obtained');
                    set({ localStream: existingLocalStream });
                }
            } else {
                console.log('🔁 Reusing existing local stream');
                hadLocalTracks = existingLocalStream.getTracks().length > 0;
            }

            // Create peer connection
            const peerConnection = new RTCPeerConnection(ICE_SERVERS);

            // Add local stream to peer connection
            if (existingLocalStream && hadLocalTracks) {
                existingLocalStream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, existingLocalStream as MediaStream);
                    console.log(`📡 Added ${track.kind} track to peer connection`);
                });
            } else {
                // No local tracks available: add recvonly transceivers to still receive remote
                peerConnection.addTransceiver('video', { direction: 'recvonly' });
                peerConnection.addTransceiver('audio', { direction: 'recvonly' });
                console.log('🎧 Using recvonly transceivers (no local media)');
            }

            // Handle remote stream
            peerConnection.ontrack = (event) => {
                console.log('📡 Received remote stream');
                const [remoteStream] = event.streams;
                set({ remoteStream });
            };

            // Handle ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('🧊 Sending ICE candidate');
                    const { socket, currentCall, lastSignalContext } = get();
                    const targetPeerId = currentCall?.peerId || lastSignalContext?.peerId;
                    const roomId = currentCall?.roomId || lastSignalContext?.roomId;
                    if (socket && targetPeerId && roomId) {
                        socket.emit('webrtc-ice-candidate', {
                            candidate: event.candidate,
                            targetUserId: targetPeerId,
                            roomId: roomId
                        });
                    }
                }
            };

            set({ peerConnection });

            // If this is the caller, create and send offer
            if (callData.receiverId) {
                console.log('📞 Creating offer as caller...');
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);

                const { socket } = get();
                if (socket) {
                    // Save context for ICE before remote description is set
                    set({ lastSignalContext: { peerId: callData.receiverId, roomId: callData.roomId } });
                    socket.emit('webrtc-offer', {
                        offer: offer,
                        targetUserId: callData.receiverId,
                        roomId: callData.roomId
                    });
                }
            }

        } catch (error) {
            console.error('❌ Error setting up WebRTC:', error);
        } finally {
            set({ isSettingUp: false });
        }
    },

    handleWebRTCOffer: async (data: any) => {
        console.log('📨 Received WebRTC offer');
        console.log('📨 data' ,data);

        let { peerConnection, socket, currentCall } = get();

        console.log(peerConnection, socket)
        if (!peerConnection) {
            console.log('🧱 No peerConnection yet, initializing setup before answering');
            await get().setupWebRTC({ roomId: data.roomId });
            peerConnection = get().peerConnection;
        }

        // Ensure currentCall is available for downstream logic and UI
        if (!currentCall) {
            set({
                currentCall: {
                    roomId: data.roomId,
                    peerId: data.fromUserId,
                    peerName: 'Peer',
                    isActive: true
                },
                lastSignalContext: { peerId: data.fromUserId, roomId: data.roomId }
            });
            currentCall = get().currentCall;
        }

        if (peerConnection && socket) {
        // if ( socket ) {
            try {
                await peerConnection.setRemoteDescription(data.offer);
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                console.log("Answer Created : ", answer)
                socket.emit('webrtc-answer', {
                    answer: answer,
                    targetUserId: data.fromUserId,
                    roomId: data.roomId
                });

                console.log('📤 Sent WebRTC answer');
            } catch (error) {
                console.error('❌ Error handling WebRTC offer:', error);
            }
        }
    },

    handleWebRTCAnswer: async (data: any) => {
        console.log('📨 Received WebRTC answer');

        const { peerConnection } = get();

        if (peerConnection) {
            try {
                await peerConnection.setRemoteDescription(data.answer);
                console.log('✅ WebRTC connection established');
            } catch (error) {
                console.error('❌ Error handling WebRTC answer:', error);
            }
        }
    },

    handleWebRTCIceCandidate: async (data: any) => {
        console.log('🧊 Received ICE candidate');

        const { peerConnection } = get();

        if (peerConnection) {
            try {
                await peerConnection.addIceCandidate(data.candidate);
            } catch (error) {
                console.error('❌ Error handling ICE candidate:', error);
            }
        }
    },

    cleanupCall: () => {
        console.log('🧹 Cleaning up call...');

        const { localStream, remoteStream, screenStream, peerConnection } = get();

        // Stop all streams
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
        }
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
        }

        // Close peer connection
        if (peerConnection) {
            peerConnection.close();
        }

        set({
            currentCall: null,
            peerConnection: null,
            localStream: null,
            remoteStream: null,
            screenStream: null,
            isScreenSharing: false
        });
    },

    // Setters
    setIncomingCall: (call) => set({ incomingCall: call }),
    setCurrentCall: (call) => set({ currentCall: call }),
    setLocalStream: (stream) => set({ localStream: stream }),
    setRemoteStream: (stream) => set({ remoteStream: stream }),
    setOnlineUsers: (users) => set({ onlineUsers: users })
}));