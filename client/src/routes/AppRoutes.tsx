import React from "react";
import { Routes, Route } from "react-router-dom";
import { lazy } from "react";

// Lazy imports
const NotFound = lazy(() => import("../pages/NotFound"));
const SignIn = lazy(() => import("../pages/SignIn"));
const Login = lazy(() => import("../pages/Login"));
const Home = lazy(() => import("../pages/Home"));
const ProfilePage = lazy(() => import("../pages/Profile"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const FindJobs = lazy(() => import("../pages/FindJob"));
const SingleJobDetails = lazy(() => import("../pages/SingleJobDetails"));
const FindFreelancer = lazy(() => import("../pages/FindFreelancer"));
const Wallet = lazy(() => import("../pages/Wallet"));
const ChatPage = lazy(() => import("../pages/Chat"));
const VideoCall = lazy(() => import("../pages/VideoCall"));
const PaymentSuccess = lazy(() => import("../pages/PaymentSuccess"));
const ActiveJobs = lazy(() => import("../pages/ActiveJobs"));
const ActiveJobDetails = lazy(() => import("../pages/ActiveJobDetails"));
const MyReviews = lazy(() => import("../pages/MyReviews"));
const MyAnalytics = lazy(() => import("../pages/MyAnalytics"));
const AdminLogin = lazy(() => import("../pages/Admin/AdminLogin"));
const AdminSignup = lazy(() => import("../pages/Admin/AdminSignup"));
const NotificationPage = lazy(() => import("../pages/Notifications"));
const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard"));

export default function AppRoutes() {
  return (
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
  );
}
