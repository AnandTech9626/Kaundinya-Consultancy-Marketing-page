import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Printer,
  Trash2,
} from "lucide-react";
import {
  Badge,
  Card,
  FileDropzone,
  FormField,
  Input,
  Select,
  Skeleton,
  StatusTimeline,
} from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import type {
  PaperSize,
  PrintBinding,
  PrintColor,
  PrintJob,
  PrintSides,
} from "@kaundinya/config";
import { createPrintJob, fetchPrintJobs } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate, formatINR } from "../lib/formats";

const PAGE_RATE = 5;

const PRINT_BADGE: Record<PrintJob["status"], BadgeVariant> = {
  queued: "warning",
  printing: "info",
  ready_for_pickup: "gold",
  completed: "success",
};

const PRINT_LABEL: Record<PrintJob["status"], string> = {
  queued: "Queued",
  printing: "Printing",
  ready_for_pickup: "Ready for pickup",
  completed: "Completed",
};

const PRINT_STAGES = [
  { id: "queued", label: "Queued", description: "File received securely" },
  { id: "printing", label: "Printing", description: "Your pages are being printed" },
  {
    id: "ready_for_pickup",
    label: "Ready for pickup",
    description: "Collect from the confirmed pickup point",
  },
  { id: "completed", label: "Completed", description: "Printout collected" },
];

const PAPER_SIZES: PaperSize[] = ["A4", "A3"];
const COLOR_MODES: { value: PrintColor; label: string }[] = [
  { value: "bw", label: "Black & white" },
  { value: "color", label: "Colour" },
];
const SIDES: { value: PrintSides; label: string }[] = [
  { value: "single", label: "Single-sided" },
  { value: "double", label: "Double-sided" },
];
const BINDINGS: { value: PrintBinding; label: string }[] = [
  { value: "none", label: "No binding" },
  { value: "staple", label: "Staple" },
  { value: "spiral", label: "Spiral" },
];

const BINDING_LABEL: Record<PrintBinding, string> = {
  none: "No binding",
  staple: "Staple",
  spiral: "Spiral",
};

const SIDES_LABEL: Record<PrintSides, string> = {
  single: "Single-sided",
  double: "Double-sided",
};

const COLOR_LABEL: Record<PrintColor, string> = {
  bw: "B&W",
  color: "Colour",
};

function numberInRange(value: string, min: number, max: number) {
  return Math.max(min, Math.min(max, Number(value) || min));
}

export function Printouts() {
  const { data, loading, error, refetch } = useAsync(fetchPrintJobs);
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState("1");
  const [copies, setCopies] = useState("1");
  const [paperSize, setPaperSize] = useState<PaperSize>("A4");
  const [colorMode, setColorMode] = useState<PrintColor>("bw");
  const [sides, setSides] = useState<PrintSides>("single");
  const [binding, setBinding] = useState<PrintBinding>("none");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<PrintJob | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const jobs = data ?? [];
  const pageCount = numberInRange(pages, 1, 500);
  const copyCount = numberInRange(copies, 1, 50);
  const total = pageCount * copyCount * PAGE_RATE;
  const canSubmit = files.length > 0 && !submitting;
  const latestJob = [...jobs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const job = await createPrintJob({
        file: files[0],
        copies: copyCount,
        pages: pageCount,
        paperSize,
        colorMode,
        sides,
        binding,
      });
      setCreated(job);
      setFiles([]);
      refetch();
    } catch {
      setSubmitError("We couldn't queue this print job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <Link
        to="/digital-services"
        className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-hover"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to digital services
      </Link>

      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-gold">
          Digital Services
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Printouts
        </h1>
        <p className="text-muted mt-1">
          Upload a file, choose your print options, and see the price update live.
          Pickup only.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FileDropzone
              files={files}
              onChange={setFiles}
              multiple={false}
              accept=".pdf,image/*"
              label="Upload a file to print"
              hint="PDF, JPG or PNG up to 10 MB. Auto-deleted after printing."
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Pages in file" htmlFor="print-pages" required>
                <Input
                  id="print-pages"
                  inputMode="numeric"
                  value={pages}
                  onChange={(event) =>
                    setPages(event.target.value.replace(/\D/g, "").slice(0, 3))
                  }
                  onBlur={() => setPages(String(pageCount))}
                />
              </FormField>
              <FormField label="Copies" htmlFor="print-copies" required>
                <Input
                  id="print-copies"
                  inputMode="numeric"
                  value={copies}
                  onChange={(event) =>
                    setCopies(event.target.value.replace(/\D/g, "").slice(0, 2))
                  }
                  onBlur={() => setCopies(String(copyCount))}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Paper size" htmlFor="print-paper">
                <Select
                  id="print-paper"
                  value={paperSize}
                  onChange={(event) =>
                    setPaperSize(event.target.value as PaperSize)
                  }
                >
                  {PAPER_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Colour" htmlFor="print-colour">
                <Select
                  id="print-colour"
                  value={colorMode}
                  onChange={(event) =>
                    setColorMode(event.target.value as PrintColor)
                  }
                >
                  {COLOR_MODES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Print sides" htmlFor="print-sides">
                <Select
                  id="print-sides"
                  value={sides}
                  onChange={(event) =>
                    setSides(event.target.value as PrintSides)
                  }
                >
                  {SIDES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Binding" htmlFor="print-binding">
                <Select
                  id="print-binding"
                  value={binding}
                  onChange={(event) =>
                    setBinding(event.target.value as PrintBinding)
                  }
                >
                  {BINDINGS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="rounded-xl border border-border-subtle bg-ivory px-4 py-3 space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                    Live price
                  </p>
                  <p className="text-xs text-muted">
                    ₹{PAGE_RATE} per page × {pageCount}{" "}
                    {pageCount === 1 ? "page" : "pages"} × {copyCount}{" "}
                    {copyCount === 1 ? "copy" : "copies"}
                  </p>
                </div>
                <p className="text-xl font-extrabold text-charcoal">
                  {formatINR(total)}
                </p>
              </div>
              <p className="text-[10px] text-muted-light">
                {paperSize} · {COLOR_LABEL[colorMode]} ·{" "}
                {SIDES_LABEL[sides]} · {BINDING_LABEL[binding]}
              </p>
            </div>

            {created && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-700">
                  {created.fileName} queued · {created.pages ?? pageCount} pages ·{" "}
                  {created.copies} copies · {formatINR(created.price)}. Pickup
                  details are shared after confirmation. The file auto-deletes on{" "}
                  {formatDate(created.autoDeletedAt)}.
                </p>
              </div>
            )}

            {submitError && <p className="text-[11px] text-rose-600">{submitError}</p>}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gold hover:bg-gold-hover px-4 py-2.5 text-sm font-bold text-charcoal transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Queuing...
                </>
              ) : (
                "Queue print job"
              )}
            </button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold" />
              <h2 className="text-sm font-extrabold text-charcoal">
                Pickup only
              </h2>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Printouts are collected from the confirmed pickup point. Exact
              address and timing are shared after your order is confirmed.
            </p>
            <div className="flex items-start gap-2 rounded-lg bg-ivory-light px-3 py-2">
              <Trash2 className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted leading-relaxed">
                Files are removed 24 hours after printing. We do not keep copies
                or use them for anything else.
              </p>
            </div>
          </Card>

          {latestJob && (
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-gold" />
                  <h2 className="text-sm font-extrabold text-charcoal">
                    Current print status
                  </h2>
                </div>
                <Badge variant={PRINT_BADGE[latestJob.status]}>
                  {PRINT_LABEL[latestJob.status]}
                </Badge>
              </div>
              <p className="text-[11px] text-muted truncate">
                {latestJob.fileName}
              </p>
              <StatusTimeline
                stages={PRINT_STAGES}
                currentId={latestJob.status}
              />
            </Card>
          )}

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-gold" />
                <h2 className="text-sm font-extrabold text-charcoal">
                  Print history
                </h2>
              </div>
              <span className="text-[11px] text-muted">{jobs.length}</span>
            </div>

            {error ? (
              <button
                type="button"
                onClick={refetch}
                className="text-xs font-bold text-gold hover:text-gold-hover cursor-pointer"
              >
                Couldn't load history. Try again
              </button>
            ) : loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-xs text-muted">No print jobs yet.</p>
            ) : (
              <ul className="space-y-2">
                {jobs.map((job) => (
                  <li
                    key={job.id}
                    className="rounded-lg border border-border-subtle bg-white px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-charcoal truncate">
                        {job.fileName}
                      </p>
                      <Badge variant={PRINT_BADGE[job.status]}>
                        {PRINT_LABEL[job.status]}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted mt-0.5">
                      {job.pages ? `${job.pages} pages · ` : ""}
                      {job.copies} copies · {formatINR(job.price)} ·{" "}
                      {formatDate(job.createdAt)}
                    </p>
                    {job.paperSize && (
                      <p className="text-[10px] text-muted-light">
                        {job.paperSize} · {COLOR_LABEL[job.colorMode ?? "bw"]} ·{" "}
                        {SIDES_LABEL[job.sides ?? "single"]} ·{" "}
                        {BINDING_LABEL[job.binding ?? "none"]}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
