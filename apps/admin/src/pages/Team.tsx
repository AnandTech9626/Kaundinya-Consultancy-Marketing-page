import { useState, type FormEvent } from "react";
import { Mail, Pencil, Plus, Power, UserCog, X } from "lucide-react";
import { Badge, Button, Card, FormField, Input, Select, Skeleton } from "@kaundinya/ui";
import type { Staff } from "@kaundinya/config";
import {
  createStaff,
  fetchEnquiries,
  fetchStaff,
  updateStaff,
} from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { initials } from "../lib/formats";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Team() {
  const { data: staffList, loading, error, refetch } = useAsync(fetchStaff);
  const { data: enquiries } = useAsync(fetchEnquiries);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Staff["role"]>("agent");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const openLeadsFor = (staffId: string) =>
    (enquiries ?? []).filter(
      (enquiry) =>
        enquiry.assignedTo === staffId &&
        enquiry.status !== "converted" &&
        enquiry.status !== "lost"
    ).length;

  const staff = staffList ?? [];

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setName("");
    setEmail("");
    setRole("agent");
    setFormError(null);
  };

  const startAdd = () => {
    setEditing(null);
    setName("");
    setEmail("");
    setRole("agent");
    setFormError(null);
    setShowForm(true);
  };

  const startEdit = (member: Staff) => {
    setEditing(member);
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setFormError(null);
    setShowForm(true);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setFormError("Enter a valid name.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setFormError("Enter a valid email address.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await updateStaff(editing.id, {
          name: name.trim(),
          email: email.trim(),
          role,
        });
      } else {
        await createStaff({ name: name.trim(), email: email.trim(), role });
      }
      resetForm();
      refetch();
    } catch {
      setFormError("We couldn't save this member. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (member: Staff) => {
    setBusy(member.id);
    try {
      await updateStaff(member.id, { active: !member.active });
      refetch();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Team
          </h1>
          <p className="text-muted mt-1">
            Staff accounts, roles and current lead load.
          </p>
        </div>
        {!showForm && (
          <Button onClick={startAdd}>
            <Plus className="w-4 h-4" />
            Add member
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-charcoal">
                {editing ? "Edit member" : "Add team member"}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {editing
                  ? "Update the name, email or role."
                  : "New members can sign in immediately."}
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 rounded-lg text-muted hover:bg-ivory hover:text-charcoal transition-colors cursor-pointer"
              aria-label="Close form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Full name" htmlFor="staff-name" required>
              <Input
                id="staff-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Priya Sharma"
              />
            </FormField>
            <FormField label="Email" htmlFor="staff-email" required>
              <Input
                id="staff-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@kaundinya.com"
              />
            </FormField>
            <FormField label="Role" htmlFor="staff-role" required>
              <Select
                id="staff-role"
                value={role}
                onChange={(event) => setRole(event.target.value as Staff["role"])}
              >
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </Select>
            </FormField>

            {formError && (
              <p className="sm:col-span-3 text-[11px] text-rose-600">{formError}</p>
            )}

            <div className="sm:col-span-3 flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={resetForm} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editing ? "Save changes" : "Add member"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load the team.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <Card key={member.id} className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-charcoal text-gold font-bold flex items-center justify-center text-sm">
                  {initials(member.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-charcoal truncate">
                    {member.name}
                  </p>
                  <p className="text-[11px] text-muted flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3" /> {member.email}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Badge
                  variant={member.role === "admin" ? "gold" : "neutral"}
                  className="capitalize"
                >
                  <UserCog className="w-3 h-3" /> {member.role}
                </Badge>
                <Badge variant={member.active ? "success" : "danger"}>
                  {member.active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="mt-4 border-t border-border-subtle pt-3 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Open leads
                </span>
                <span className="text-lg font-extrabold text-charcoal tabular-nums">
                  {openLeadsFor(member.id)}
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(member)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border-subtle bg-white px-2.5 py-1.5 text-[11px] font-bold text-charcoal hover:border-gold/60 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void toggleActive(member)}
                  disabled={busy === member.id}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                    member.active
                      ? "border-border-subtle bg-white text-muted hover:border-rose-300 hover:text-rose-600"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {member.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
