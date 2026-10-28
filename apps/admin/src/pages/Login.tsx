import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button, Card, FormField, Input } from "@kaundinya/ui";
import { SITE_INFO } from "@kaundinya/config";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";
import { adminLogin } from "../lib/mockApi";

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return error.message;
    if (error.status === 401) return "Invalid email or password.";
    if (error.fieldErrors?.email) return error.fieldErrors.email;
    return error.message;
  }
  return "Sign in failed. Please try again.";
}

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 4) {
      setError("Enter your email and password (min 4 characters).");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const session = await adminLogin(email.trim(), password);
      login(session);
      navigate("/overview", { replace: true });
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex flex-col">
      <header className="h-16 flex items-center justify-center px-6">
        <div className="bg-white rounded-md px-2 py-1.5">
          <img
            src="/images/logo.webp"
            alt={SITE_INFO.name}
            className="h-8 w-auto object-contain"
          />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-charcoal tracking-tight">
                Admin Sign In
              </h1>
              <p className="text-sm text-muted">
                {SITE_INFO.fullName} — staff access only
              </p>
            </div>

            <FormField label="Email address" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                placeholder="you@kaundinyaconsultancy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                invalid={!!error}
              />
            </FormField>

            <FormField label="Password" htmlFor="password" required>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                invalid={!!error}
              />
            </FormField>

            {error && <p className="text-[11px] text-rose-600 -mt-2">{error}</p>}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
