import { Users, ShieldCheck } from "lucide-react";
import { Badge, Card, Skeleton } from "@kaundinya/ui";
import { fetchClients } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate, formatMobile } from "../lib/formats";

export function Clients() {
  const { data, loading, error, refetch } = useAsync(fetchClients);
  const clients = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Clients
        </h1>
        <p className="text-muted mt-1">Verified users registered through the app.</p>
      </div>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load clients.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-5 space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-28" />
            </Card>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-charcoal">No clients yet</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ivory text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Requests</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-t border-border-subtle hover:bg-ivory/60">
                    <td className="px-4 py-3 font-bold text-charcoal">{c.name}</td>
                    <td className="px-4 py-3">
                      <p className="text-charcoal-light">{formatMobile(c.mobile)}</p>
                      <p className="text-xs text-muted">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{formatDate(c.joinedAt)}</td>
                    <td className="px-4 py-3 text-charcoal font-semibold tabular-nums">{c.requestsCount}</td>
                    <td className="px-4 py-3">
                      {c.verified ? (
                        <Badge variant="success">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="neutral">Unverified</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
