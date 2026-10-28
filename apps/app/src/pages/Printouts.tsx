import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Printer, Trash2 } from "lucide-react";
import {
  Badge,
  Card,
  FileDropzone,
  FormField,
  Input,
  Skeleton,
} from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import type { PrintJob } from "@kaundinya/config";
import { createPrintJob, fetchPrintJobs } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate, formatINR } from "../lib/formats";

const PRINT_BADGE: Record<PrintJob["status"], BadgeVariant> = {
  queued: "gold",
  printing: "info",
  completed: "success",
};

export function Printouts() {
  const { data, loading, error, refetch } = useAsync(fetchPrintJobs);
  const [files, setFiles] = useState<File[]>([]);
  const [copies, setCopies] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<PrintJob | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const jobs = data ?? [];
  const copyCount = Math.max(1, Math.min(50, Number(copies) || 1));
  const price = copyCount * 5;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (files.length === 0 || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const job = await createPrintJob({
        fileName: files[0].name,
        copies: copyCount,
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
    <div className="space-y-6 max-w-4xl">
      <Link
        to="/home-services"
        className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-hover"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home services
      </Link>

      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-gold">
          Home Services
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Printouts
        </h1>
        <p className="text-muted mt-1">
          Upload a PDF, see live pricing and get it delivered. Files auto-delete after
          printing.
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

            <FormField label="Copies" htmlFor="print-copies" required>
              <Input
                id="print-copies"
                inputMode="numeric"
                value={copies}
                onChange={(event) =>
                  setCopies(event.target.value.replace(/\D/g, "").slice(0, 2))
                }
              />
            </FormField>

            <div className="flex items-center justify-between rounded-xl bg-ivory px-4 py-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Live price
                </p>
                <p className="text-xs text-muted">
                  ₹5 per page × {copyCount} {copyCount === 1 ? "copy" : "copies"}
                </p>
              </div>
              <p className="text-xl font-extrabold text-charcoal">{formatINR(price)}</p>
            </div>

            {created && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-700">
                  {created.fileName} queued · {created.copies} copies ·{" "}
                  {formatINR(created.price)}. It will be auto-deleted on{" "}
                  {formatDate(created.autoDeletedAt)}.
                </p>
              </div>
            )}

            {submitError && <p className="text-[11px] text-rose-600">{submitError}</p>}

            <button
              type="submit"
              disabled={files.length === 0 || submitting}
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
              <Trash2 className="w-4 h-4 text-gold" />
              <h2 className="text-sm font-extrabold text-charcoal">
                Auto-delete promise
              </h2>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Files are removed from our servers 24 hours after printing. We do not keep
              copies or use them for anything else.
            </p>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-gold" />
                <h2 className="text-sm font-extrabold text-charcoal">Print history</h2>
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
                      <Badge variant={PRINT_BADGE[job.status]}>{job.status}</Badge>
                    </div>
                    <p className="text-[10px] text-muted mt-0.5">
                      {job.copies} copies · {formatINR(job.price)} ·{" "}
                      {formatDate(job.createdAt)}
                    </p>
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
