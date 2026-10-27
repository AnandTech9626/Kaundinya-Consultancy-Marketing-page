import { useState, type FormEvent } from "react";
import { CheckCircle2, ShieldCheck, User, MapPin } from "lucide-react";
import { Badge, Button, Card, FormField, Input } from "@kaundinya/ui";
import { useAuth } from "../lib/auth";
import { fetchRequests } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "K";
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

function formatMobile(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return digits ? `+91 ${digits}` : "";
}

export function Profile() {
  const { user, login } = useAuth();
  const { data } = useAsync(fetchRequests);
  const requestCount = data?.length ?? 0;

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [pinCode, setPinCode] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (user) {
      login({ ...user, name, email });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const displayName = name.trim() || user?.name || "Client";
  const mobile = formatMobile(user?.mobile ?? "");
  const clientId = user?.mobile ? `KIS-${user.mobile.replace(/\D/g, "").slice(-4)}` : "KIS-0000";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Profile
        </h1>
        <p className="text-muted mt-1">Manage your personal details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left rail — identity */}
        <div className="lg:col-span-4">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-charcoal text-gold ring-4 ring-gold/20 flex items-center justify-center text-2xl font-extrabold">
                {initials(displayName)}
              </div>
              <h2 className="mt-3 text-lg font-extrabold text-charcoal tracking-tight break-words">
                {displayName}
              </h2>
              <p className="text-xs text-muted">Client</p>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="success">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </Badge>
              <Badge variant="gold">KYC Verified</Badge>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border-subtle pt-4 text-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Requests</p>
                <p className="text-lg font-extrabold text-charcoal">{requestCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Member since</p>
                <p className="text-lg font-extrabold text-charcoal">2026</p>
              </div>
            </div>

            <div className="mt-4 border-t border-border-subtle pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Client ID</p>
              <p className="text-xs font-semibold text-charcoal-light">{clientId}</p>
            </div>
          </Card>
        </div>

        {/* Right — form */}
        <div className="lg:col-span-8">
          <Card className="p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal details */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gold" />
                  <h3 className="text-xs font-extrabold text-charcoal uppercase tracking-wider">
                    Personal details
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Full name" htmlFor="name" required>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </FormField>
                  <FormField label="Email address" htmlFor="email">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </FormField>
                </div>
              </section>

              <div className="border-t border-border-subtle" />

              {/* Contact & location */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold" />
                  <h3 className="text-xs font-extrabold text-charcoal uppercase tracking-wider">
                    Contact &amp; location
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Mobile number (verified)" htmlFor="mobile">
                    <div className="relative">
                      <Input
                        id="mobile"
                        value={mobile}
                        disabled
                        className="bg-ivory cursor-not-allowed pr-24"
                      />
                      <span className="absolute inset-y-0 right-2 flex items-center">
                        <Badge variant="success">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </Badge>
                      </span>
                    </div>
                  </FormField>
                  <FormField label="PIN code" htmlFor="pinCode">
                    <Input
                      id="pinCode"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6-digit PIN code"
                    />
                  </FormField>
                </div>
                <p className="text-[11px] text-muted-light">
                  Your mobile number is verified and can't be edited here.
                </p>
              </section>

              {/* Save bar */}
              <div className="flex items-center gap-3 border-t border-border-subtle pt-4">
                <Button type="submit">Save Changes</Button>
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Saved
                  </span>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
