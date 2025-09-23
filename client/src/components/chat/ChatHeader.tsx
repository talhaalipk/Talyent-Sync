// components/chat/ChatHeader.tsx
import React from "react";
import { useChatStore } from "../../store/chatStore";

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  className?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onToggleSidebar, className = "" }) => {
  const { currentReceiverInfo, selectedConversationId, onlineUsers, conversations } =
    useChatStore();

  // Get receiver info from conversations or current receiver info
  const receiverInfo =
    currentReceiverInfo || conversations.find((c) => c.user._id === selectedConversationId)?.user;

  const isOnline = receiverInfo && onlineUsers.some((user) => user.userId === receiverInfo._id);

  if (!selectedConversationId || !receiverInfo) {
    return (
      <div className={`p-4 border-b border-gray-200 flex items-center bg-white ${className}`}>
        <button
          className="p-2 rounded-full hover:bg-gray-100 mr-2 md:hidden"
          onClick={onToggleSidebar}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-[#1F2937]">Messages</h2>
      </div>
    );
  }

  return (
    <div className={`p-4 border-b border-gray-200 flex items-center bg-white ${className}`}>
      {/* Mobile menu button */}
      <button
        className="p-2 rounded-full hover:bg-gray-100 mr-2 md:hidden"
        onClick={onToggleSidebar}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* User info */}
      <div className="flex items-center flex-1">
        <div className="relative">
          <img
            src={receiverInfo.profilePic}
            alt={receiverInfo.name || receiverInfo.UserName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              isOnline ? "bg-[#10B981]" : "bg-gray-400"
            }`}
          ></span>
        </div>

        <div className="ml-3 flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-[#1F2937] truncate">
            {receiverInfo.name || receiverInfo.UserName}
          </h2>
          <p className="text-sm text-gray-500 capitalize">
            {isOnline ? (
              <span className="text-[#10B981]">● Online</span>
            ) : (
              <span>● {receiverInfo.role}</span>
            )}
          </p>
        </div>

        {/* Optional: Action buttons */}
        <div className="flex items-center space-x-2">
          {/* Video call button - optional */}
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-[#2E90EB]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>

          {/* Info button - optional */}
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-[#2E90EB]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
