import { useState, type FormEvent } from "react";
import { CheckCircle2, Megaphone, Send } from "lucide-react";
import { Button, Card, FormField, Input, Select, Textarea } from "@kaundinya/ui";

export function Notifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    // POST /api/admin/notifications/broadcast (mock)
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    setSent(true);
    setTitle("");
    setMessage("");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Notifications
        </h1>
        <p className="text-muted mt-1">
          Broadcast an announcement to clients (appears in their app notifications).
        </p>
      </div>

      {sent && (
        <Card className="p-4 border-emerald-200 bg-emerald-50 flex items-center gap-2 text-sm text-emerald-800">
          <CheckCircle2 className="w-4 h-4" />
          Broadcast sent to {audience === "all" ? "all clients" : "verified clients"}.
        </Card>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title" htmlFor="title" required>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New service available"
            />
          </FormField>

          <FormField label="Message" htmlFor="message" required>
            <Textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your announcement…"
            />
          </FormField>

          <FormField label="Audience" htmlFor="audience">
            <Select id="audience" value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option value="all">All clients</option>
              <option value="verified">Verified clients only</option>
            </Select>
          </FormField>

          <Button type="submit" disabled={sending || !title.trim() || !message.trim()}>
            {sending ? <Megaphone className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
            {sending ? "Sending…" : "Send broadcast"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
