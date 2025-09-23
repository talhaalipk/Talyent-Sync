// components/chat/SentMessage.tsx
import React from "react";
import { type Message } from "../../store/chatStore";

interface SentMessageProps {
  message: Message;
}

const SentMessage: React.FC<SentMessageProps> = ({ message }) => {
  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="mb-4 flex justify-end">
      <div className="bg-[#134848] rounded-lg p-3 max-w-xs">
        {message.messageType === "image" && (
          <div className="rounded overflow-hidden mb-2">
            <img
              src={message.fileUrl}
              alt={message.fileName || "Image"}
              className="w-full h-auto cursor-pointer"
              onClick={() => window.open(message.fileUrl, "_blank")}
            />
          </div>
        )}

        {message.messageType === "file" && (
          <div className="flex items-center bg-white bg-opacity-10 rounded p-2 mb-2">
            <div className="bg-white bg-opacity-20 p-2 rounded mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{message.fileName}</p>
              <p className="text-xs text-white text-opacity-70">
                {message.fileSize && formatFileSize(message.fileSize)}
              </p>
            </div>
            <button
              className="ml-2 p-1 rounded hover:bg-white hover:bg-opacity-10"
              onClick={() => window.open(message.fileUrl, "_blank")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
          </div>
        )}

        {message.messageType === "text" && <p className="text-sm text-white">{message.content}</p>}

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-white opacity-70">{formatTime(message.createdAt)}</p>
          <div className="ml-2">
            {message.read ? (
              <span className="text-white opacity-70">✓✓</span>
            ) : (
              <span className="text-white opacity-70">✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// components/chat/ReceivedMessage.tsx
interface ReceivedMessageProps {
  message: Message;
}

const ReceivedMessage: React.FC<ReceivedMessageProps> = ({ message }) => {
  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="mb-4">
      <div className="flex items-start">
        <img
          src={message.senderId.profilePic}
          alt={message.senderId.name || message.senderId.UserName}
          className="w-8 h-8 rounded-full mr-3 object-cover"
        />
        <div className="bg-[#F9FAFB] rounded-lg p-3 max-w-xs">
          {message.messageType === "image" && (
            <div className="rounded overflow-hidden mb-2">
              <img
                src={message.fileUrl}
                alt={message.fileName || "Image"}
                className="w-full h-auto cursor-pointer"
                onClick={() => window.open(message.fileUrl, "_blank")}
              />
            </div>
          )}

          {message.messageType === "file" && (
            <div className="flex items-center bg-white rounded border border-gray-200 p-2 mb-2">
              <div className="bg-blue-100 p-2 rounded mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-[#2E90EB]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{message.fileName}</p>
                <p className="text-xs text-gray-500">
                  {message.fileSize && formatFileSize(message.fileSize)}
                </p>
              </div>
              <button
                className="ml-2 p-1 rounded hover:bg-gray-100"
                onClick={() => window.open(message.fileUrl, "_blank")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#2E90EB]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
            </div>
          )}

          {message.messageType === "text" && (
            <p className="text-sm text-[#1F2937]">{message.content}</p>
          )}

          <p className="text-xs text-gray-500 mt-1">{formatTime(message.createdAt)}</p>
        </div>
      </div>
    </div>
  );
};

export { SentMessage, ReceivedMessage };
