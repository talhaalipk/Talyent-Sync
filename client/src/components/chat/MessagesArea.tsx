// components/chat/MessagesArea.tsx
import React, { useEffect, useRef } from "react";
import { useChatStore, type Message } from "../../store/chatStore";
import { SentMessage, ReceivedMessage } from "./SentMessage";

interface MessagesAreaProps {
  currentUserId?: string;
  className?: string;
}

const MessagesArea: React.FC<MessagesAreaProps> = ({ currentUserId, className = "" }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    currentMessages,
    currentReceiverInfo,
    isLoadingMessages,
    isNewConversation,
    typingUsers,
    selectedConversationId,
  } = useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const isTypingInCurrentChat = typingUsers.find((user) => user.userId === selectedConversationId);

  if (isLoadingMessages) {
    return (
      <div className={`flex-1 flex items-center justify-center bg-white ${className}`}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#134848] mb-2"></div>
          <p className="text-gray-500 text-sm">Loading messages...</p>
        </div>
      </div>
    );
  }

  // New conversation empty state
  if (isNewConversation && currentMessages.length === 0 && currentReceiverInfo) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center bg-white ${className}`}>
        <div className="text-center mb-8">
          <img
            src={currentReceiverInfo.profilePic}
            alt={currentReceiverInfo.name || currentReceiverInfo.UserName}
            className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
          />
          <h2 className="text-xl font-semibold text-[#1F2937] mb-2">
            {currentReceiverInfo.name || currentReceiverInfo.UserName}
          </h2>
          <p className="text-gray-500 capitalize text-sm mb-4">{currentReceiverInfo.role}</p>
        </div>

        <div className="bg-[#F9FAFB] rounded-lg p-6 shadow-sm border max-w-md text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-[#1F2937] mb-2">Start a conversation</h3>
          <p className="text-gray-600 text-sm">
            Send a message to begin chatting with{" "}
            {currentReceiverInfo.name || currentReceiverInfo.UserName}
          </p>
        </div>
      </div>
    );
  }

  // No conversation selected
  if (!selectedConversationId) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center bg-white ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-semibold text-[#1F2937] mb-2">Welcome to Messages</h2>
          <p className="text-gray-500">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 overflow-y-auto p-4 bg-white ${className}`}
      style={{ height: "calc(100vh - 140px)" }}
    >
      {currentMessages.map((message: Message) => {
        if (message.senderId._id === currentUserId) {
          return <SentMessage key={message._id} message={message} />;
        } else {
          return <ReceivedMessage key={message._id} message={message} />;
        }
      })}

      {/* Typing indicator */}
      {isTypingInCurrentChat && (
        <div className="mb-4">
          <div className="flex items-start">
            <img
              src={isTypingInCurrentChat.userData.profilePic}
              alt={isTypingInCurrentChat.userData.name || isTypingInCurrentChat.userData.UserName}
              className="w-8 h-8 rounded-full mr-3 object-cover"
            />
            <div className="bg-[#F9FAFB] rounded-lg p-3 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {isTypingInCurrentChat.userData.name || isTypingInCurrentChat.userData.UserName} is
                typing...
              </p>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesArea;
