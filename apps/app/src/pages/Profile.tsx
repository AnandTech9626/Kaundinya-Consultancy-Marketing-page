import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button, Card, FormField, Input } from "@kaundinya/ui";
import { useAuth } from "../lib/auth";

export function Profile() {
  const { user, login } = useAuth();
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

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Profile
        </h1>
        <p className="text-muted mt-1">
          Manage your personal details.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <FormField label="Mobile number (verified)" htmlFor="mobile">
            <Input
              id="mobile"
              value={`+91 ${user?.mobile ?? ""}`}
              disabled
              className="bg-ivory cursor-not-allowed"
            />
          </FormField>

          <FormField label="PIN code" htmlFor="pinCode">
            <Input
              id="pinCode"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit PIN code"
            />
          </FormField>

          <div className="flex items-center gap-3 pt-2">
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
  );
}
