import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, FileText, Printer } from "lucide-react";
import { Badge, Card, Skeleton } from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import { fetchDocuments, fetchPrintJobs } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate, formatINR } from "../lib/formats";
import { statusMeta } from "../lib/status";
import { InfoTip } from "../components/InfoTip";

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  status: string;
  variant: BadgeVariant;
  date: string;
  href: string;
};

export function DigitalServices() {
  const { data, loading, error, refetch } = useAsync(
    async () => {
      const [documents, prints] = await Promise.all([
        fetchDocuments(),
        fetchPrintJobs(),
      ]);
      return { documents, prints };
    },
    []
  );

  const documents = [...(data?.documents ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const prints = [...(data?.prints ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const activity: ActivityItem[] = [
    ...documents.slice(0, 3).map((document) => {
      const status = statusMeta(document.status ?? "documents_received");
      return {
        id: document.id,
        title: document.docType,
        detail: document.fileName,
        status: status.label,
        variant: status.badge,
        date: document.createdAt,
        href: "/digital-services/id-updates",
      };
    }),
    ...prints.slice(0, 3).map((print) => {
      const status = statusMeta(print.status);
      return {
        id: print.id,
        title: "Printout",
        detail: `${print.fileName} · ${formatINR(print.price)}`,
        status: status.label,
        variant: status.badge,
        date: print.createdAt,
        href: "/digital-services/printouts",
      };
    }),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-5">
      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand">
          Digital Services
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Documents and printouts, handled securely
          </h1>
          <InfoTip
            label="About Digital Services"
            text="Upload ID documents for secure updates, queue print jobs with transparent pricing, and track pickup status. Files are stored and handled through the consultancy."
          />
        </div>
        <p className="text-muted-foreground mt-1">
          Upload once, track every step, and collect your printouts without the
          queue.
        </p>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-3">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:col-span-2">
          <Link to="/digital-services/id-updates" className="block h-full">
            <Card hoverable className="p-5 sm:p-6 h-full flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <Badge variant="gold">Secure</Badge>
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-foreground">
                  ID &amp; Document Updates
                </h2>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Aadhaar and voter ID updates with watermarked uploads and a
                  clear status timeline.
                </p>
              </div>
              <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0" />
                  Four update types supported
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0" />
                  Upload checklist and consent
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0" />
                  File history in one place
                </li>
              </ul>
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-brand">
                Start an update
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Card>
          </Link>

          <Link to="/digital-services/printouts" className="block h-full">
            <Card hoverable className="p-5 sm:p-6 h-full flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center">
                  <Printer className="w-5 h-5" />
                </div>
                <Badge variant="gold">₹5 / page</Badge>
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-foreground">
                  Printouts
                </h2>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Upload a PDF, choose paper and binding, and pick it up when it
                  is ready.
                </p>
              </div>
              <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0" />
                  Live per-page price
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0" />
                  Pickup only, no delivery
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0" />
                  Files auto-delete after printing
                </li>
              </ul>
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-brand">
                Send a print job
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Card>
          </Link>
        </div>

        <Card className="p-5 sm:p-6 h-full flex flex-col gap-3 xl:col-span-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-extrabold text-foreground">
              Recent activity
            </h2>
            <span className="text-[11px] font-semibold text-muted-foreground">
              {documents.length + prints.length} total
            </span>
          </div>

          {error ? (
            <button
              type="button"
              onClick={refetch}
              className="text-xs font-bold text-brand hover:text-brand-hover cursor-pointer text-left"
            >
              Couldn't load activity. Try again
            </button>
          ) : loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : activity.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface-raised px-4 py-6 text-center">
              <p className="text-xs font-bold text-foreground">
                No digital activity yet
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Start with an ID update or a printout.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {activity.map((item) => (
                <li key={`${item.href}-${item.id}`}>
                  <Link
                    to={item.href}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 hover:border-brand/60 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center shrink-0">
                      {item.href.includes("printouts") ? (
                        <Printer className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.detail}
                      </p>
                      <p className="text-[10px] text-muted-foreground/80">
                        {formatDate(item.date)}
                      </p>
                    </div>
                    <Badge variant={item.variant}>{item.status}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
