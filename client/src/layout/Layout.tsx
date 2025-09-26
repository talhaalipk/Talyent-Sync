import { useLocation } from "react-router-dom";
import { lazy } from "react";

const Header = lazy(() => import("../components/Header/Header"));
const Footer = lazy(() => import("../components/Footer"));

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isVideoCallRoute = location.pathname.startsWith("/videocall");

  const routesWithoutFooter = [
    "/dashboard",
    "/notifications",
    "/wallet",
    "/chat",
    "/payment/success",
    "/Active-jobs",
    "/active-job/:contractId",
    "/my-reviews",
    "/my-analytics",
  ];

  const shouldHideFooter =
    isAdminRoute ||
    isVideoCallRoute ||
    routesWithoutFooter.some((route) => {
      if (route === "/chat") {
        return location.pathname === "/chat" || location.pathname.startsWith("/chat/");
      }
      if (route === "/active-jobs") {
        return location.pathname === "/active-jobs" || location.pathname.startsWith("/active-job/");
      }
      return location.pathname === route;
    });

  return (
    <>
      {!isAdminRoute && <Header />}
      {children}
      {!shouldHideFooter && <Footer />}
    </>
  );
}
