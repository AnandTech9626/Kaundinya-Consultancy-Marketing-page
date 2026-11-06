import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import {
  Badge,
  Card,
  FileDropzone,
  FormField,
  Select,
  Skeleton,
  StatusTimeline,
} from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import {
  MODULE_STAGES,
  SERVICE_CATALOG,
  type DigitalServiceStatus,
} from "@kaundinya/config";
import { fetchDocuments, uploadDocument } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate } from "../lib/formats";

const DOC_SERVICE = SERVICE_CATALOG.find((item) => item.id === "hs-documents");
const DOC_TYPES = DOC_SERVICE?.issueTypes ?? [
  "Aadhaar update",
  "Voter ID update",
  "Address change",
  "Name correction",
];

const DOC_REQUIREMENTS: Record<string, string[]> = {
  "Aadhaar update": [
    "Existing Aadhaar copy",
    "Address proof",
    "Mobile number linked to Aadhaar",
  ],
  "Voter ID update": [
    "Existing voter ID (EPIC)",
    "Address proof",
    "Date of birth proof",
  ],
  "Address change": [
    "Existing ID",
    "New address proof",
    "Self-declaration",
  ],
  "Name correction": [
    "Existing ID",
    "Marriage certificate or gazette notification",
    "Supporting affidavit, if applicable",
  ],
};

const STATUS_STAGES = MODULE_STAGES["digital-services"];

const STATUS_META: Record<
  DigitalServiceStatus,
  { label: string; variant: BadgeVariant }
> = {
  submitted: { label: "Submitted", variant: "warning" },
  documents_received: { label: "Documents received", variant: "info" },
  processing: { label: "Processing", variant: "gold" },
  completed: { label: "Completed", variant: "success" },
};

export function DocumentServices() {
  const { data, loading, error, refetch } = useAsync(fetchDocuments);
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const documents = data ?? [];
  const latestDocument = [...documents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
  const latestStatus = latestDocument?.status ?? "documents_received";
  const requirements = DOC_REQUIREMENTS[docType] ?? [];
  const canSubmit = files.length > 0 && consent && !submitting;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await uploadDocument({
        docType,
        file: files[0],
      });
      setFiles([]);
      setConsent(false);
      setSuccess(
        `${created.fileName} uploaded and watermarked "${created.watermark}".`
      );
      refetch();
    } catch {
      setSubmitError("We couldn't upload this document. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <Link
        to="/digital-services"
        className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:text-brand-hover"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to digital services
      </Link>

      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand">
          Digital Services
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          ID &amp; Document Updates
        </h1>
        <p className="text-muted-foreground mt-1">
          Choose the correction, upload the required documents, and track the
          update from submission to completion.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="p-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="What needs updating?" htmlFor="doc-type" required>
                <Select
                  id="doc-type"
                  value={docType}
                  onChange={(event) => {
                    setDocType(event.target.value);
                    setSuccess(null);
                  }}
                >
                  {DOC_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </FormField>

              <div className="rounded-xl border border-border bg-surface-raised p-3.5 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Keep ready
                </p>
                <ul className="space-y-1.5">
                  {requirements.map((requirement) => (
                    <li
                      key={requirement}
                      className="flex items-start gap-2 text-[11px] text-foreground-soft"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>

              <FileDropzone
                files={files}
                onChange={setFiles}
                multiple={false}
                accept="image/*,.pdf"
                label="Upload document"
                hint="JPG, PNG or PDF up to 10 MB. Files are watermarked on upload."
              />

              <label className="flex items-start gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
                />
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  I confirm these documents belong to me or a person I am
                  authorised to represent, and I consent to Kaundinya using them
                  only to process this update.
                </span>
              </label>

              {success && (
                <div className="flex items-start gap-2 rounded-xl border border-success-fg/20 bg-success-soft px-3 py-2.5">
                  <CheckCircle2 className="w-4 h-4 text-success-fg shrink-0 mt-0.5" />
                  <p className="text-[11px] text-success-fg">{success}</p>
                </div>
              )}

              {submitError && (
                <p className="text-[11px] text-danger-fg">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand hover:bg-brand-hover px-4 py-2.5 text-sm font-bold text-on-brand transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload securely"
                )}
              </button>
            </form>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand" />
              <h2 className="text-sm font-extrabold text-foreground">
                How we protect it
              </h2>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <li>Every upload is watermarked for the requested ID update only.</li>
              <li>Files are visible only to the coordinator handling your case.</li>
              <li>You can request deletion once the update is complete.</li>
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand" />
                <h2 className="text-sm font-extrabold text-foreground">
                  Update status
                </h2>
              </div>
              {latestDocument && (
                <Badge variant={STATUS_META[latestStatus].variant}>
                  {STATUS_META[latestStatus].label}
                </Badge>
              )}
            </div>

            {latestDocument ? (
              <>
                <p className="text-[11px] text-muted-foreground">
                  {latestDocument.docType} · started{" "}
                  {formatDate(latestDocument.createdAt)}
                </p>
                <StatusTimeline
                  stages={STATUS_STAGES}
                  currentId={latestStatus}
                />
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface-raised px-4 py-6 text-center">
                <p className="text-xs font-bold text-foreground">
                  No update started yet
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Upload a document to start the timeline.
                </p>
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-foreground">
                Uploaded files
              </h2>
              <span className="text-[11px] text-muted-foreground">{documents.length}</span>
            </div>

            {error ? (
              <button
                type="button"
                onClick={refetch}
                className="text-xs font-bold text-brand hover:text-brand-hover cursor-pointer"
              >
                Couldn't load files. Try again
              </button>
            ) : loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-xs text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              <ul className="space-y-2">
                {documents.map((document) => {
                  const status = STATUS_META[document.status ?? "documents_received"];
                  return (
                    <li
                      key={document.id}
                      className="flex items-start gap-2 rounded-lg border border-border bg-surface px-3 py-2"
                    >
                      <FileCheck2 className="w-4 h-4 text-success-fg shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-foreground truncate">
                            {document.fileName}
                          </p>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {document.docType} · {formatDate(document.createdAt)}
                        </p>
                        <p className="text-[10px] text-subtle-foreground italic">
                          {document.watermark}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
