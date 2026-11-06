import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Lock,
  Printer,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Badge, Card, Skeleton } from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import type { PrintJob } from "@kaundinya/config";
import { fetchDocuments, fetchPrintJobs } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate, formatINR } from "../lib/formats";

const DOC_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  submitted: { label: "Submitted", variant: "warning" },
  documents_received: { label: "Documents received", variant: "info" },
  processing: { label: "Processing", variant: "gold" },
  completed: { label: "Completed", variant: "success" },
};

const PRINT_STATUS: Record<PrintJob["status"], { label: string; variant: BadgeVariant }> = {
  queued: { label: "Queued", variant: "warning" },
  printing: { label: "Printing", variant: "info" },
  ready_for_pickup: { label: "Ready for pickup", variant: "gold" },
  completed: { label: "Completed", variant: "success" },
};

const STEPS = [
  {
    title: "Choose a service",
    description: "Pick ID updates or printouts.",
  },
  {
    title: "Upload securely",
    description: "Files are watermarked and access-controlled.",
  },
  {
    title: "Track or pick up",
    description: "Follow the timeline, or collect printouts when ready.",
  },
];

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
      const status = DOC_STATUS[document.status ?? "documents_received"];
      return {
        id: document.id,
        title: document.docType,
        detail: document.fileName,
        status: status.label,
        variant: status.variant,
        date: document.createdAt,
        href: "/digital-services/id-updates",
      };
    }),
    ...prints.slice(0, 3).map((print) => {
      const status = PRINT_STATUS[print.status];
      return {
        id: print.id,
        title: "Printout",
        detail: `${print.fileName} · ${formatINR(print.price)}`,
        status: status.label,
        variant: status.variant,
        date: print.createdAt,
        href: "/digital-services/printouts",
      };
    }),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-gold">
          Digital Services
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Documents and printouts, handled securely
        </h1>
        <p className="text-muted mt-1">
          Upload once, track every step, and collect your printouts without the
          queue.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/digital-services/id-updates" className="block">
          <Card hoverable className="p-5 sm:p-6 h-full space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <Badge variant="gold">Secure</Badge>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-charcoal">
                ID &amp; Document Updates
              </h2>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Aadhaar and voter ID updates with watermarked uploads and a clear
                status timeline.
              </p>
            </div>
            <ul className="space-y-1.5 text-[11px] text-muted">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0" />
                Four update types supported
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0" />
                Upload checklist and consent
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0" />
                File history in one place
              </li>
            </ul>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-gold">
              Start an update
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Card>
        </Link>

        <Link to="/digital-services/printouts" className="block">
          <Card hoverable className="p-5 sm:p-6 h-full space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <Badge variant="gold">₹5 / page</Badge>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-charcoal">Printouts</h2>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Upload a PDF, choose paper and binding, and pick it up when it is
                ready.
              </p>
            </div>
            <ul className="space-y-1.5 text-[11px] text-muted">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0" />
                Live per-page price
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0" />
                Pickup only, no delivery
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0" />
                Files auto-delete after printing
              </li>
            </ul>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-gold">
              Send a print job
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Card>
        </Link>
      </div>

      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-gold" />
          <h2 className="text-sm font-extrabold text-charcoal">How it works</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="rounded-xl border border-border-subtle bg-ivory-light p-3.5 space-y-1.5"
            >
              <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-charcoal text-white text-[11px] font-extrabold">
                {index + 1}
              </span>
              <p className="text-xs font-bold text-charcoal">{step.title}</p>
              <p className="text-[11px] text-muted leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-extrabold text-charcoal">
              Recent digital activity
            </h2>
            <span className="text-[11px] text-muted">
              {documents.length + prints.length} total
            </span>
          </div>

          {error ? (
            <button
              type="button"
              onClick={refetch}
              className="text-xs font-bold text-gold hover:text-gold-hover cursor-pointer"
            >
              Couldn't load activity. Try again
            </button>
          ) : loading ? (
            <div className="space-y-2">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          ) : activity.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-subtle bg-ivory-light px-4 py-6 text-center">
              <p className="text-xs font-bold text-charcoal">
                No digital activity yet
              </p>
              <p className="text-[11px] text-muted mt-1">
                Start with an ID update or a printout.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {activity.map((item) => (
                <li key={`${item.href}-${item.id}`}>
                  <Link
                    to={item.href}
                    className="flex items-center gap-3 rounded-xl border border-border-subtle bg-white px-3 py-2.5 hover:border-gold/60 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center shrink-0">
                      {item.href.includes("printouts") ? (
                        <Printer className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-charcoal truncate">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-muted truncate">
                        {item.detail} · {formatDate(item.date)}
                      </p>
                    </div>
                    <Badge variant={item.variant}>{item.status}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gold" />
            <h2 className="text-sm font-extrabold text-charcoal">
              Privacy by default
            </h2>
          </div>
          <ul className="space-y-2 text-[11px] text-muted leading-relaxed">
            <li className="flex gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              ID uploads are watermarked for Kaundinya use only.
            </li>
            <li className="flex gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              Files are visible only to the assigned coordinator.
            </li>
            <li className="flex gap-2">
              <Trash2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              Print files auto-delete after printing.
            </li>
            <li className="flex gap-2">
              <Printer className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              Pickup details are shared once your order is confirmed.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
