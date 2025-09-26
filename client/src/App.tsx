import { BrowserRouter as Router } from "react-router-dom";
import { Suspense, useEffect } from "react";
import Spinner from "./ui/Spinner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthStore } from "./store/authStore";
import { useNotificationInit } from "./store/notificationStore";
import VideoCallProvider from "./components/videocall/VideoCallProvider";
import Layout from "./layout/Layout";
import AppRoutes from "./routes/AppRoutes";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  const user = useAuthStore((s) => s.user);
  const { initialize, cleanup } = useNotificationInit();

  useEffect(() => {
    if (user) initialize();
    return () => cleanup();
  }, [user]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Suspense fallback={<Spinner />}>
          <VideoCallProvider>
            <Layout>
              <AppRoutes />
            </Layout>
          </VideoCallProvider>
        </Suspense>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

// import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
// import { lazy, Suspense, useEffect } from "react";
// import Spinner from "./ui/Spinner";
// import FindFreelancer from "./pages/FindFreelancer";
// import { GoogleOAuthProvider } from "@react-oauth/google";
// import ChatPage from "./pages/Chat";
// import NotificationPage from "./pages/Notifications";
// import Wallet from "./pages/Wallet";
// import PaymentSuccess from "./pages/PaymentSuccess";
// import { useAuthStore } from "./store/authStore";
// import { useNotificationInit } from "./store/notificationStore";
// import VideoCall from "./pages/VideoCall";
// import VideoCallProvider from "./components/videocall/VideoCallProvider";

// // Lazy imports
// const NotFound = lazy(() => import("./pages/NotFound"));
// const Header = lazy(() => import("./components/Header/Header"));
// const Footer = lazy(() => import("./components/Footer"));
// const SignIn = lazy(() => import("./pages/SignIn"));
// const Login = lazy(() => import("./pages/Login"));
// const Home = lazy(() => import("./pages/Home"));
// const ProfilePage = lazy(() => import("./pages/Profile"));
// const Dashboard = lazy(() => import("./pages/Dashboard"));
// const FindJobs = lazy(() => import("./pages/FindJob"));
// const SingleJobDetails = lazy(() => import("./pages/SingleJobDetails"));
// import ActiveJobs from "./pages/ActiveJobs";
// import ActiveJobDetails from "./pages/ActiveJobDetails";
// import MyReviews from "./pages/MyReviews";
// import MyAnalytics from "./pages/MyAnalytics";
// import AdminLogin from "./pages/Admin/AdminLogin";
// import AdminSignup from "./pages/Admin/AdminSignup";
// import AdminDashboard from "./pages/Admin/AdminDashboard";

// const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// // Layout component to conditionally render Header and Footer
// function Layout({ children }: { children: React.ReactNode }) {
//   const location = useLocation();

//   // Check if current route is an admin route
//   const isAdminRoute = location.pathname.startsWith("/admin");

//   // Check if current route is a video call route
//   const isVideoCallRoute = location.pathname.startsWith("/videocall");

//   // Define routes where Footer should be hidden
//   const routesWithoutFooter = [
//     "/dashboard",
//     "/notifications",
//     "/wallet",
//     "/chat",
//     "/payment/success",
//     "/Active-jobs",
//     "/active-job/:contractId",
//     "/my-reviews",
//     "/my-analytics"
//   ];

//   // Check if current route should hide footer
//   const shouldHideFooter = isAdminRoute ||
//                           isVideoCallRoute ||
//                           routesWithoutFooter.some(route => {
//                             if (route === "/chat") {
//                               // Handle both /chat and /chat/:receiverId
//                               return location.pathname === "/chat" || location.pathname.startsWith("/chat/");
//                             }
//                             if (route === "/active-jobs") {
//                               // Handle both /active-jobs and /active-job/:contractId
//                               return location.pathname === "/active-jobs" || location.pathname.startsWith("/active-job/");
//                             }
//                             return location.pathname === route;
//                           });

//   return (
//     <>
//       {!isAdminRoute && <Header />}
//       {children}
//       {!shouldHideFooter && <Footer />}
//     </>
//   );
// }

// function App() {
//   // Select only the user to avoid subscribing to the entire auth store
//   const user = useAuthStore((s) => s.user);
//   const { initialize, cleanup } = useNotificationInit();
//   console.log("App Redered, user");
//   console.log("App Redered, user");

//   useEffect(() => {
//     if (user) {
//       // Initialize notifications - user is logged in
//       initialize();
//     }
//     return () => {
//       cleanup();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user]);

//   return (
//     <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
//       <Router>
//         <Suspense fallback={<Spinner />}>
//           <VideoCallProvider>
//             <Layout>
//               <Routes>
//                 <Route path="/" element={<Home />} />
//                 <Route path="/signup" element={<SignIn />} />
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/profile" element={<ProfilePage />} />
//                 <Route path="/dashboard" element={<Dashboard />} />
//                 <Route path="/notifications" element={<NotificationPage />} />
//                 <Route path="/jobs" element={<FindJobs />} />
//                 <Route path="/jobs/:id" element={<SingleJobDetails />} />
//                 <Route path="/freelancers" element={<FindFreelancer />} />
//                 <Route path="/wallet" element={<Wallet />} />
//                 <Route path="/chat" element={<ChatPage />} />
//                 <Route path="/chat/:receiverId" element={<ChatPage />} />
//                 <Route path="/videocall/:roomId" element={<VideoCall />} />
//                 <Route path="/payment/success" element={<PaymentSuccess />} />
//                 <Route path="/active-jobs" element={<ActiveJobs />} />
//                 <Route path="/active-job/:contractId" element={<ActiveJobDetails />} />
//                 <Route path="/my-reviews" element={<MyReviews />} />
//                 <Route path="/my-analytics" element={<MyAnalytics />} />
//                 <Route path="/admin/login" element={<AdminLogin />} />
//                 <Route path="/admin/sign-in" element={<AdminSignup />} />
//                 <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
//                 <Route path="*" element={<NotFound />} />
//               </Routes>
//             </Layout>
//           </VideoCallProvider>
//         </Suspense>
//       </Router>
//     </GoogleOAuthProvider>
//   );
// }

// export default App;
