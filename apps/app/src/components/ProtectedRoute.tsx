import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spinner } from "@kaundinya/ui";
import { useAuth } from "../lib/auth";

export function ProtectedRoute() {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <Spinner className="w-6 h-6 text-gold" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const atOnboarding = location.pathname === "/onboarding";

  if (!user.profileComplete && !atOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (user.profileComplete && atOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
