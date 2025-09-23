import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useChatStore } from "../../store/chatStore";

export default function MessageIcon() {
  const navigate = useNavigate();
  const { conversations } = useChatStore();

  // Calculate total unread messages across all conversations
  const totalUnread = conversations.reduce((count, convo) => count + (convo.unreadCount || 0), 0);

  const handleClick = () => {
    navigate("/chat");
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
    >
      <MessageCircle className="w-5 h-5 text-[#134848]" />
      {totalUnread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
          {totalUnread}
        </span>
      )}
    </button>
  );
}
