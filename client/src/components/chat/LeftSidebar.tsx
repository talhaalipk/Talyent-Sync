// components/chat/LeftSidebar.tsx
import React, { useEffect } from "react";
import { useChatStore } from "../../store/chatStore";
import type { Conversation } from "../../store/chatStore";
// import type {Conversation, OnlineUser } from '../../store/chatStore';
import { useNavigate, useParams } from "react-router-dom";

interface LeftSidebarProps {
  className?: string;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const { receiverId } = useParams();
  const {
    conversations,
    onlineUsers,
    isLoadingConversations,
    selectedConversationId,
    currentReceiverInfo,
    loadConversations,
    selectConversation,
  } = useChatStore();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.some((user) => user.userId === userId);
  };

  const handleConversationClick = (userId: string) => {
    navigate(`/chat/${userId}`);
    selectConversation(userId);
  };

  const formatLastMessageTime = (date: Date): string => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const truncateMessage = (message: string, maxLength: number = 30): string => {
    return message.length > maxLength ? message.substring(0, maxLength) + "..." : message;
  };

  return (
    <div className={`w-64 border-r border-gray-200 bg-[#F9FAFB] ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#134848]">Messages</h1>
          <p className="text-sm text-[#1F2937]">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Conversations List */}
      <div className="overflow-y-auto h-[calc(100vh-80px)]">
        {isLoadingConversations ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#134848]"></div>
          </div>
        ) : (
          <>
            {/* Show current receiver if it's a new conversation */}
            {receiverId &&
              currentReceiverInfo &&
              !conversations.find((c) => c.user._id === receiverId) && (
                <div
                  className={`p-4 border-b cursor-pointer transition duration-200 ${
                    selectedConversationId === receiverId
                      ? "bg-[#e0f2fe] border-l-4 border-[#2E90EB]"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleConversationClick(receiverId)}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        src={currentReceiverInfo.profilePic}
                        alt={currentReceiverInfo.name || currentReceiverInfo.UserName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          isUserOnline(currentReceiverInfo._id) ? "bg-[#10B981]" : "bg-gray-400"
                        }`}
                      ></span>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#1F2937] truncate">
                          {currentReceiverInfo.name || currentReceiverInfo.UserName}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 capitalize">{currentReceiverInfo.role}</p>
                      <p className="text-xs text-[#2E90EB] mt-1">Start a conversation</p>
                    </div>
                  </div>
                </div>
              )}

            {/* Regular conversations */}
            {conversations.map((conversation: Conversation) => (
              <div
                key={conversation._id}
                className={`p-4 border-b cursor-pointer transition duration-200 ${
                  selectedConversationId === conversation.user._id
                    ? "bg-[#e0f2fe] border-l-4 border-[#2E90EB]"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleConversationClick(conversation.user._id)}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={conversation.user.profilePic}
                      alt={conversation.user.name || conversation.user.UserName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        isUserOnline(conversation.user._id) ? "bg-[#10B981]" : "bg-gray-400"
                      }`}
                    ></span>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#1F2937] truncate">
                        {conversation.user.name || conversation.user.UserName}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-[#2E90EB] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-2">
                          {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate flex-1 mr-2">
                        {conversation.lastMessage.messageType === "image" && "📷 Photo"}
                        {conversation.lastMessage.messageType === "file" && "📎 File"}
                        {conversation.lastMessage.messageType === "text" &&
                          truncateMessage(conversation.lastMessage.content)}
                      </p>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatLastMessageTime(conversation.lastMessage.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty state */}
            {conversations.length === 0 && !isLoadingConversations && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-gray-500 text-sm">No conversations yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  Start chatting with someone to see your conversations here
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
