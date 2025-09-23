// pages/Chat.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatStore } from "../store/chatStore";
import { useUserStore } from "../store/userStore"; // ✅ import zustand user store
import LeftSidebar from "../components/chat/LeftSidebar";
import MessagesArea from "../components/chat/MessagesArea";
import InputArea from "../components/chat/InputArea";
import ChatHeader from "../components/chat/ChatHeader";

const ChatPage: React.FC = () => {
  const { receiverId } = useParams<{ receiverId?: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ get user from Zustand store instead of props
  const { profile: currentUser, fetchProfile } = useUserStore();

  const {
    // initializeSocket,
    // disconnectSocket,
    selectConversation,
    isConnected,
    selectedConversationId,
    // resetChatState,
  } = useChatStore();

  console.log("isConnected from chat : ", isConnected);

  useEffect(() => {
    // Ensure user profile is loaded
    if (!currentUser) {
      fetchProfile();
    }
  }, [currentUser, fetchProfile]);

  // useEffect(() => {
  //   // Get token from localStorage or cookies for socket authentication

  //   //   initializeSocket();

  //   // return () => {
  //   //   disconnectSocket();
  //   //   resetChatState();
  //   // };
  // }, [initializeSocket, disconnectSocket, resetChatState]);

  useEffect(() => {
    // Handle route changes
    if (receiverId && receiverId !== selectedConversationId) {
      selectConversation(receiverId);
    }
  }, [receiverId, selectedConversationId, selectConversation]);

  // Helper function to get cookie value
  // const getCookieValue = (name: string): string | null => {
  //   const value = `; ${document.cookie}`;
  //   const parts = value.split(`; ${name}=`);
  //   if (parts.length === 2) {
  //     return parts.pop()?.split(";").shift() || null;
  //   }
  //   return null;
  // };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500">Please log in to access chat</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-2 px-4 py-2 bg-[#134848] text-white rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter bg-white">
      <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] max-w-7xl mx-auto">
        {/* Left Sidebar - Mobile Collapsible */}
        <LeftSidebar
          className={`
            ${sidebarOpen ? "block" : "hidden"} 
            md:block 
            md:w-64 
            fixed md:relative 
            z-50 md:z-auto 
            h-full 
            bg-white md:bg-[#F9FAFB]
            shadow-lg md:shadow-none
          `}
        />

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-transparent backdrop-blur-md  bg-opacity-50 z-40 md:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Right Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile/Desktop Header */}
          <ChatHeader onToggleSidebar={toggleSidebar} className="md:border-b border-gray-200" />

          {/* Connection Status */}
          {!isConnected && (
            <div className="bg-[#F59E0B] text-white text-center py-2 text-sm">
              ⚠️ Reconnecting to chat server...
            </div>
          )}

          {/* Messages Area */}
          <MessagesArea currentUserId={currentUser._id} className="flex-1 min-h-0" />

          {/* Input Area */}
          <InputArea />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
