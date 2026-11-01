import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@kaundinya/ui";
import { useAuth } from "../lib/auth";

export function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
      return;
    }

    const mobile = (params.get("mobile") ?? "").replace(/\D/g, "");
    if (mobile.length === 10) {
      navigate(`/login?mobile=${mobile}&step=otp`, { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate, params, user]);

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Spinner />
        Redirecting to sign in...
      </div>
    </div>
  );
}
