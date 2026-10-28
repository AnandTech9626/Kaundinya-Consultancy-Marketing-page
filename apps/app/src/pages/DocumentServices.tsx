import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileCheck2, Loader2, Lock } from "lucide-react";
import {
  Card,
  FileDropzone,
  FormField,
  Select,
  Skeleton,
} from "@kaundinya/ui";
import { SERVICE_CATALOG } from "@kaundinya/config";
import { fetchDocuments, uploadDocument } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate } from "../lib/formats";

const DOC_SERVICE = SERVICE_CATALOG.find((item) => item.id === "hs-documents");
const DOC_TYPES = DOC_SERVICE?.issueTypes ?? [
  "Aadhaar update",
  "Voter ID update",
];

export function DocumentServices() {
  const { data, loading, error, refetch } = useAsync(fetchDocuments);
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const documents = data ?? [];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (files.length === 0 || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await uploadDocument({
        docType,
        fileName: files[0].name,
      });
      setFiles([]);
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
          Document portal
        </h1>
        <p className="text-muted mt-1">
          Securely upload documents for Aadhaar or voter ID updates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="What needs updating?" htmlFor="doc-type" required>
              <Select
                id="doc-type"
                value={docType}
                onChange={(event) => setDocType(event.target.value)}
              >
                {DOC_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </FormField>

            <FileDropzone
              files={files}
              onChange={setFiles}
              multiple={false}
              accept="image/*,.pdf"
              label="Upload document"
              hint="JPG, PNG or PDF up to 10 MB. Files are watermarked on upload."
            />

            {success && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-700">{success}</p>
              </div>
            )}

            {submitError && (
              <p className="text-[11px] text-rose-600">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={files.length === 0 || submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gold hover:bg-gold-hover px-4 py-2.5 text-sm font-bold text-charcoal transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
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

        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-gold" />
              <h2 className="text-sm font-extrabold text-charcoal">How we protect it</h2>
            </div>
            <ul className="space-y-2 text-xs text-muted leading-relaxed">
              <li>Every upload is watermarked "For Kaundinya ID Update Only".</li>
              <li>Files are visible only to the coordinator handling your case.</li>
              <li>You can request deletion once the update is complete.</li>
            </ul>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-charcoal">Uploaded files</h2>
              <span className="text-[11px] text-muted">{documents.length}</span>
            </div>

            {error ? (
              <button
                type="button"
                onClick={refetch}
                className="text-xs font-bold text-gold hover:text-gold-hover cursor-pointer"
              >
                Couldn't load files. Try again
              </button>
            ) : loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-xs text-muted">No documents uploaded yet.</p>
            ) : (
              <ul className="space-y-2">
                {documents.map((document) => (
                  <li
                    key={document.id}
                    className="flex items-start gap-2 rounded-lg border border-border-subtle bg-white px-3 py-2"
                  >
                    <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-charcoal truncate">
                        {document.fileName}
                      </p>
                      <p className="text-[10px] text-muted">
                        {document.docType} · {formatDate(document.createdAt)}
                      </p>
                      <p className="text-[10px] text-muted-light italic">
                        {document.watermark}
                      </p>
                    </div>
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
