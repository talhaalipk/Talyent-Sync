import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Spinner from "./ui/Spinner";
import FindFreelancer from "./pages/FindFreelancer";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ChatPage from "./pages/Chat";
import NotificationPage from "./pages/Notifications";
import Wallet from "./pages/Wallet";
import PaymentSuccess from "./pages/PaymentSuccess";
import { useAuthStore } from "./store/authStore";
import { useNotificationInit } from "./store/notificationStore";
import VideoCall from "./pages/VideoCall";
import VideoCallProvider from "./components/videocall/VideoCallProvider";

// Lazy imports
const NotFound = lazy(() => import("./pages/NotFound"));
const Header = lazy(() => import("./components/Header/Header"));
const Footer = lazy(() => import("./components/Footer"));
const SignIn = lazy(() => import("./pages/SignIn"));
const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FindJobs = lazy(() => import("./pages/FindJob"));
const SingleJobDetails = lazy(() => import("./pages/SingleJobDetails"));
import ActiveJobs from "./pages/ActiveJobs";
import ActiveJobDetails from "./pages/ActiveJobDetails";
import MyReviews from "./pages/MyReviews";
import MyAnalytics from "./pages/MyAnalytics";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminSignup from "./pages/Admin/AdminSignup";
import AdminDashboard from "./pages/Admin/AdminDashboard";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Layout component to conditionally render Header and Footer
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Check if current route is a video call route
  const isVideoCallRoute = location.pathname.startsWith("/videocall");

  return (
    <>
      {!isAdminRoute && <Header />}
      {children}
      {/* Hide Footer on admin and video call pages */}
      {!isAdminRoute && !isVideoCallRoute && <Footer />}
    </>
  );
}

function App() {
  // Select only the user to avoid subscribing to the entire auth store
  const user = useAuthStore((s) => s.user);
  const { initialize, cleanup } = useNotificationInit();
  console.log("App Redered, user");
  console.log("App Redered, user");
  
  useEffect(() => {
    if (user) {
      // Initialize notifications when user is logged in
      initialize();
    }
    // Always disconnect socket when user changes or component unmounts
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Depend on user only; initialize/cleanup are memoized

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Suspense fallback={<Spinner />}>
          <VideoCallProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<SignIn />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/notifications" element={<NotificationPage />} />
                <Route path="/jobs" element={<FindJobs />} />
                <Route path="/jobs/:id" element={<SingleJobDetails />} />
                <Route path="/freelancers" element={<FindFreelancer />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/chat/:receiverId" element={<ChatPage />} />
                <Route path="/videocall/:roomId" element={<VideoCall />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/active-jobs" element={<ActiveJobs />} />
                <Route path="/active-job/:contractId" element={<ActiveJobDetails />} />
                <Route path="/my-reviews" element={<MyReviews />} />
                <Route path="/my-analytics" element={<MyAnalytics />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/sign-in" element={<AdminSignup />} />
                <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </VideoCallProvider>
        </Suspense>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
