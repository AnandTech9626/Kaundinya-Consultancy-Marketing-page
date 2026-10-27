import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@kaundinya/ui";
import { useAuth } from "../lib/auth";

export function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const mobile = (params.get("mobile") ?? "").replace(/\D/g, "");
    if (mobile.length >= 10) {
      login({ name: "Kaundinya Client", email: "", mobile });
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [login, navigate, params]);

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Spinner />
        Verifying your session...
      </div>
    </div>
  );
}
