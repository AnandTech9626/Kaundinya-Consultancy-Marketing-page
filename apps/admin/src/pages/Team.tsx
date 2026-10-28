import { Mail, UserCog } from "lucide-react";
import { Badge, Card, Skeleton } from "@kaundinya/ui";
import { fetchEnquiries, fetchStaff } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { initials } from "../lib/formats";

export function Team() {
  const { data: staffList, loading, error, refetch } = useAsync(fetchStaff);
  const { data: enquiries } = useAsync(fetchEnquiries);

  const openLeadsFor = (staffId: string) =>
    (enquiries ?? []).filter(
      (e) =>
        e.assignedTo === staffId &&
        e.status !== "converted" &&
        e.status !== "lost"
    ).length;

  const staff = staffList ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Team
        </h1>
        <p className="text-muted mt-1">Staff accounts and current lead load.</p>
      </div>

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
          {staff.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-charcoal text-gold font-bold flex items-center justify-center text-sm">
                  {initials(s.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-charcoal truncate">{s.name}</p>
                  <p className="text-[11px] text-muted flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3" /> {s.email}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Badge variant={s.role === "admin" ? "gold" : "neutral"} className="capitalize">
                  <UserCog className="w-3 h-3" /> {s.role}
                </Badge>
                <Badge variant={s.active ? "success" : "danger"}>
                  {s.active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="mt-4 border-t border-border-subtle pt-3 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Open leads
                </span>
                <span className="text-lg font-extrabold text-charcoal tabular-nums">
                  {openLeadsFor(s.id)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
