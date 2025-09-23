import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import { MessageCircle, Mail } from "lucide-react"; // Added icons for messages and notifications
import NavLink from "../../ui/NavLink";
import ButtonLink from "../../ui/ButtonLink";
import { useAuthStore } from "../../store/authStore";
// import { User } from "lucide-react"; // fallback icon
import UserMenu from "../../ui/UserMenu";
import { useChatStore } from "../../store/chatStore";
import NotificationDropdown from "./NotificationDropdown";
import MessageIcon from "./MessageIcon";
// import { useNotificationInit } from "../../store/notificationStore";

// import { io } from "socket.io-client";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, user, verifylogin } = useAuthStore();
  // const navigate = useNavigate();

  const { initializeSocket, disconnectSocket, isConnected, resetChatState, loadConversations } =
    useChatStore();
  // const { initializeNotifications, cleanupNotifications } = useNotificationInit();
  // Run verifylogin when Header mounts (check cookie & update auth state)
  useEffect(() => {
    verifylogin();
  }, [verifylogin]);

  useEffect(() => {
    console.log("isConnected from header: ", isConnected);
    console.log("isLoggedIn from header: ", isLoggedIn);
    if (isLoggedIn && user && !isConnected) {
      console.log("inside initializeSocket");
      initializeSocket();
      loadConversations();
    }
    // initializeNotifications();

    // In Header useEffect
    if (isLoggedIn && user && !isConnected) {
      console.log("inside initializeSocket");
      initializeSocket();
    }

    // Cleanup socket when user logs out or Header unmounts
    return () => {
      if (!isLoggedIn || !user) {
        disconnectSocket();
        resetChatState();
        // cleanupNotifications();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user, initializeSocket, disconnectSocket, resetChatState, isConnected]);

  // const handleMessageButtonClick = () => {
  //   navigate("/chat");
  // };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-[#134848]"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Talyent Sync
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink to="/jobs">Find Jobs</NavLink>
          <NavLink to="/freelancers">Find Freelancers</NavLink>
        </nav>

        {/* Right Side: Auth or User */}
        <div className="hidden md:flex items-center space-x-3">
          {isLoggedIn && user ? (
            <div className="flex items-center space-x-3">
              {/* Messages Icon - Desktop */}
              <MessageIcon />

              {/* Notifications Icon - Desktop */}
              <NotificationDropdown />

              {/* ✅ Use UserMenu for desktop view */}
              <UserMenu user={user} />
            </div>
          ) : (
            <>
              <ButtonLink to="/login" variant="outline">
                Login
              </ButtonLink>
              <ButtonLink to="/signup" variant="primary">
                Sign Up
              </ButtonLink>
            </>
          )}
        </div>

        {/* Mobile: Messages & Notifications (outside hamburger) + Hamburger */}
        <div className="md:hidden flex items-center space-x-3">
          {isLoggedIn && user && (
            <>
              {/* Messages Icon - Mobile (outside hamburger) */}
              <MessageIcon />

              {/* Notifications Icon - Mobile (outside hamburger) */}
              <NotificationDropdown />
            </>
          )}

          {/* Mobile Hamburger */}
          <button className="flex flex-col space-y-1.5" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="block w-6 h-0.5 bg-[#134848]"></span>
            <span className="block w-6 h-0.5 bg-[#134848]"></span>
            <span className="block w-6 h-0.5 bg-[#134848]"></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md px-6 py-4 space-y-4">
          <NavLink to="/jobs" onClick={() => setMenuOpen(false)}>
            Find Jobs
          </NavLink>
          <br />
          <br />
          <NavLink to="/freelancers" onClick={() => setMenuOpen(false)}>
            Find Freelancers
          </NavLink>
          <hr className="border-gray-200" />
          {isLoggedIn && user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <ButtonLink to="/login" variant="outline" className="mr-2.5">
                Login
              </ButtonLink>
              <ButtonLink to="/signup" variant="primary">
                Sign Up
              </ButtonLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}
