import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Inbox } from "lucide-react";
import { Badge, Card, Input, Select, Skeleton } from "@kaundinya/ui";
import type { EnquiryStatus } from "@kaundinya/config";
import { fetchEnquiries } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { ENQUIRY_STATUS, ENQUIRY_STATUS_ORDER, PRIORITY } from "../lib/status";
import { formatDate, formatMobile } from "../lib/formats";
import { useStaff } from "../lib/staff";

export function Enquiries() {
  const { data, loading, error, refetch } = useAsync(fetchEnquiries);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<EnquiryStatus | "all">("all");

  const staff = useStaff();

  const staffName = (id: string | null) =>
    id ? staff.find((s) => s.id === id)?.name ?? "—" : "Unassigned";

  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = query.trim().toLowerCase();
    return list.filter((e) => {
      const matchStatus = status === "all" || e.status === status;
      const matchQuery =
        !q ||
        e.fullName.toLowerCase().includes(q) ||
        e.mobile.includes(q) ||
        e.email.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [data, query, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Enquiries
        </h1>
        <p className="text-muted mt-1">Leads submitted through the marketing site.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          className="flex-1"
          placeholder="Search name, mobile or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          className="sm:w-48"
          value={status}
          onChange={(e) => setStatus(e.target.value as EnquiryStatus | "all")}
        >
          <option value="all">All statuses</option>
          {ENQUIRY_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {ENQUIRY_STATUS[s].label}
            </option>
          ))}
        </Select>
      </div>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load enquiries.</p>
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
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-charcoal">No enquiries found</p>
          <p className="text-sm text-muted">Try a different search or status filter.</p>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-ivory text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Enquiry</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Assigned</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.id} className="border-t border-border-subtle hover:bg-ivory/60">
                      <td className="px-4 py-3">
                        <p className="font-bold text-charcoal">{e.fullName}</p>
                        <p className="text-xs text-muted">{formatMobile(e.mobile)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-charcoal-light">{e.serviceCategory}</p>
                        <p className="text-xs text-muted truncate max-w-[16rem]">{e.specificService}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={ENQUIRY_STATUS[e.status].badge}>
                          {ENQUIRY_STATUS[e.status].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={PRIORITY[e.priority].badge}>{PRIORITY[e.priority].label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">{staffName(e.assignedTo)}</td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">{formatDate(e.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/enquiries/${e.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-gold hover:text-gold-hover"
                        >
                          View <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((e) => (
              <Link key={e.id} to={`/enquiries/${e.id}`} className="block">
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-charcoal">{e.fullName}</p>
                      <p className="text-xs text-muted">{formatMobile(e.mobile)}</p>
                      <p className="text-xs text-muted mt-1 truncate">{e.serviceCategory}</p>
                    </div>
                    <Badge variant={ENQUIRY_STATUS[e.status].badge}>
                      {ENQUIRY_STATUS[e.status].label}
                    </Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
