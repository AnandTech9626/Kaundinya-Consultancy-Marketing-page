import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Badge, Button, Card, Select, Skeleton, Textarea } from "@kaundinya/ui";
import type { Enquiry, EnquiryStatus } from "@kaundinya/config";
import {
  addEnquiryNote,
  assignEnquiry,
  fetchEnquiry,
  fetchStaff,
  updateEnquiryStatus,
} from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { ENQUIRY_STATUS, ENQUIRY_STATUS_ORDER, PRIORITY } from "../lib/status";
import { formatDate, formatMobile } from "../lib/formats";
import { useAuth } from "../lib/auth";

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="text-sm font-semibold text-charcoal break-words">{value}</p>
    </div>
  );
}

export function EnquiryDetail() {
  const { id } = useParams();
  const { staff: me } = useAuth();
  const { data, loading, error, refetch } = useAsync(
    () => fetchEnquiry(id ?? ""),
    [id]
  );
  const { data: staffList } = useAsync(fetchStaff);

  const [current, setCurrent] = useState<Enquiry | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) setCurrent(data);
  }, [data]);

  const backLink = (
    <Link
      to="/enquiries"
      className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-hover"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to enquiries
    </Link>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {backLink}
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        {backLink}
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load this enquiry.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="space-y-4">
        {backLink}
        <Card className="p-10 text-center text-sm text-muted">Enquiry not found.</Card>
      </div>
    );
  }

  const handleStatus = async (status: EnquiryStatus) => {
    setBusy(true);
    const r = await updateEnquiryStatus(current.id, status);
    if (r) setCurrent(r);
    setBusy(false);
  };

  const handleAssign = async (staffId: string) => {
    setBusy(true);
    const r = await assignEnquiry(current.id, staffId || null);
    if (r) setCurrent(r);
    setBusy(false);
  };

  const handleNote = async () => {
    if (!note.trim()) return;
    setBusy(true);
    const r = await addEnquiryNote(current.id, me?.name ?? "Admin", note.trim());
    if (r) setCurrent(r);
    setNote("");
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      {backLink}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: info + notes */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  #{current.id.toUpperCase()}
                </p>
                <h1 className="text-2xl font-extrabold text-charcoal tracking-tight">
                  {current.fullName}
                </h1>
                <p className="text-xs text-muted capitalize">Source: {current.source}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={PRIORITY[current.priority].badge}>
                  {PRIORITY[current.priority].label} priority
                </Badge>
                <Badge variant={ENQUIRY_STATUS[current.status].badge}>
                  {ENQUIRY_STATUS[current.status].label}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border-subtle pt-5">
              <Info label="Mobile" value={formatMobile(current.mobile)} />
              <Info label="Email" value={current.email} />
              <Info label="Service category" value={current.serviceCategory} />
              <Info label="Specific service" value={current.specificService} />
              <Info label="PIN code" value={current.pinCode || "—"} />
              <Info label="Submitted" value={formatDate(current.createdAt)} />
              <Info
                label="Follow-up"
                value={current.followUpAt ? formatDate(current.followUpAt) : "Not scheduled"}
              />
              <Info label="Consent" value={current.consent ? "Given" : "Not given"} />
            </div>

            <div className="border-t border-border-subtle pt-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
                Message
              </p>
              <p className="text-sm text-charcoal-light leading-relaxed">
                {current.comments || "No message provided."}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-extrabold text-charcoal tracking-tight mb-4">
              Internal notes
            </h2>

            <div className="space-y-3">
              {current.notes.length === 0 && (
                <p className="text-sm text-muted">No notes yet.</p>
              )}
              {current.notes.map((n) => (
                <div key={n.id} className="rounded-xl bg-ivory p-3 border border-border-subtle">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-charcoal">{n.author}</p>
                    <p className="text-[11px] text-muted-light">{formatDate(n.createdAt)}</p>
                  </div>
                  <p className="text-sm text-charcoal-light mt-1">{n.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <Textarea
                rows={3}
                placeholder="Add an internal note…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button onClick={handleNote} disabled={busy || !note.trim()}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Add note
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: actions */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-extrabold text-charcoal tracking-tight">
              Manage
            </h2>

            <div>
              <label htmlFor="status" className="block text-xs font-bold text-charcoal mb-1">
                Status
              </label>
              <Select
                id="status"
                value={current.status}
                disabled={busy}
                onChange={(e) => handleStatus(e.target.value as EnquiryStatus)}
              >
                {ENQUIRY_STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {ENQUIRY_STATUS[s].label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label htmlFor="assignee" className="block text-xs font-bold text-charcoal mb-1">
                Assigned to
              </label>
              <Select
                id="assignee"
                value={current.assignedTo ?? ""}
                disabled={busy}
                onChange={(e) => handleAssign(e.target.value)}
              >
                <option value="">Unassigned</option>
                {(staffList ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
