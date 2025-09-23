// components/chat/InputArea.tsx
import React, { useState, useRef, useCallback } from "react";
import { useChatStore } from "../../store/chatStore";

interface InputAreaProps {
  className?: string;
}

const InputArea: React.FC<InputAreaProps> = ({ className = "" }) => {
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    selectedConversationId,
    isSendingMessage,
    sendMessage,
    sendFileMessage,
    startTyping,
    stopTyping,
  } = useChatStore();

  const handleSendMessage = useCallback(() => {
    if (!selectedConversationId || !message.trim() || isSendingMessage) return;

    sendMessage(selectedConversationId, message);
    setMessage("");

    // Stop typing when message is sent
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    stopTyping(selectedConversationId);
  }, [selectedConversationId, message, isSendingMessage, sendMessage, stopTyping]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = useCallback(() => {
    if (!selectedConversationId) return;

    // Start typing indicator
    startTyping(selectedConversationId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedConversationId);
    }, 3000);
  }, [selectedConversationId, startTyping, stopTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    handleTyping();
  };

  const handleFileSelect = async (file: File) => {
    if (!selectedConversationId) return;

    setIsUploading(true);
    try {
      await sendFileMessage(selectedConversationId, file);
    } catch (error) {
      console.error("Failed to send file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
      e.target.value = ""; // Reset input
    }
  };

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
      e.target.value = ""; // Reset input
    }
  };

  const isDisabled = !selectedConversationId || isSendingMessage || isUploading;

  return (
    <div className={`p-4 border-t border-gray-200 bg-white ${className}`}>
      <div className="flex items-center">
        {/* File attachment button */}
        <button
          className={`p-2 rounded-full mr-2 transition-colors ${
            isDisabled ? "text-gray-300 cursor-not-allowed" : "text-[#2E90EB] hover:bg-gray-100"
          }`}
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled}
          title="Attach file"
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
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>

        {/* Image attachment button */}
        <button
          className={`p-2 rounded-full mr-2 transition-colors ${
            isDisabled ? "text-gray-300 cursor-not-allowed" : "text-[#2E90EB] hover:bg-gray-100"
          }`}
          onClick={() => imageInputRef.current?.click()}
          disabled={isDisabled}
          title="Attach image"
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
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>

        {/* Message input */}
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={
            !selectedConversationId
              ? "Select a conversation to start chatting..."
              : isUploading
                ? "Uploading file..."
                : "Type a message..."
          }
          className={`flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#2E90EB] focus:border-transparent transition-colors ${
            isDisabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
          }`}
          disabled={isDisabled}
        />

        {/* Send button */}
        <button
          onClick={handleSendMessage}
          disabled={isDisabled || !message.trim()}
          className={`ml-2 rounded-full p-2 transition-colors ${
            isDisabled || !message.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#2E90EB] text-white hover:bg-blue-600"
          }`}
          title="Send message"
        >
          {isSendingMessage || isUploading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Upload status */}
      {(isSendingMessage || isUploading) && (
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#2E90EB] mr-2"></div>
          {isUploading ? "Uploading file..." : "Sending message..."}
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        className="hidden"
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageInputChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default InputArea;
