import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useStaffAuth } from "../lib/staff-auth";

export function StaffProtectedRoute() {
  const { staff, ready } = useStaffAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!staff) {
    return <Navigate to="/login" replace />;
  }

  const atSetup = location.pathname === "/setup";

  if (!staff.profileComplete && !atSetup) {
    return <Navigate to="/setup" replace />;
  }

  if (staff.profileComplete && atSetup) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
