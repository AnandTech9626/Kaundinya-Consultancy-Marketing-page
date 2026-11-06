import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  Download,
  FileText,
  Printer,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import {
  deleteAdminDigitalDocument,
  deleteAdminPrintJob,
  fetchAdminDigitalDocuments,
  fetchAdminPrintJobs,
  fetchDigitalServicesStats,
  updateAdminDigitalDocument,
  updateAdminPrintJob,
  type AdminDigitalDocument,
  type AdminDigitalDocumentStatus,
  type AdminPrintJob,
  type AdminPrintStatus,
  type DigitalServicesStats,
} from "../lib/api";
import { formatDateTime, formatINR } from "../lib/format";
import { showToast } from "../lib/toast";
import {
  ConfirmDialog,
  SheetShell,
  StatusBadge,
  inputClass,
  labelClass,
} from "../components/AdminUi";

type Tab = "documents" | "printouts";

type Selected =
  | { kind: "document"; id: string }
  | { kind: "printout"; id: string };

const TAB_META: Array<{
  id: Tab;
  label: string;
  icon: typeof FileText;
}> = [
  { id: "documents", label: "ID updates", icon: FileText },
  { id: "printouts", label: "Printouts", icon: Printer },
];

const DOCUMENT_STATUSES: AdminDigitalDocumentStatus[] = [
  "submitted",
  "documents_received",
  "processing",
  "completed",
];

const PRINT_STATUSES: AdminPrintStatus[] = [
  "queued",
  "printing",
  "ready_for_pickup",
  "completed",
];

function statusLabel(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/^\w/, (character) => character.toUpperCase());
}

function printBindingLabel(binding: AdminPrintJob["binding"]) {
  if (binding === "staple") return "Stapled";
  if (binding === "spiral") return "Spiral";
  return "No binding";
}

export function DigitalServicesAdmin() {
  const [searchParams] = useSearchParams();
  const queryTab = searchParams.get("tab");
  const focusId = searchParams.get("request");
  const [tab, setTab] = useState<Tab>(
    queryTab === "printouts" ? "printouts" : "documents",
  );
  const [documents, setDocuments] = useState<AdminDigitalDocument[]>([]);
  const [printJobs, setPrintJobs] = useState<AdminPrintJob[]>([]);
  const [stats, setStats] = useState<DigitalServicesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: "document"; item: AdminDigitalDocument }
    | { kind: "printout"; item: AdminPrintJob }
    | null
  >(null);
  const focusHandled = useRef<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const [nextDocuments, nextPrintJobs, nextStats] = await Promise.all([
        fetchAdminDigitalDocuments(),
        fetchAdminPrintJobs(),
        fetchDigitalServicesStats(),
      ]);
      setDocuments(nextDocuments);
      setPrintJobs(nextPrintJobs);
      setStats(nextStats);
    } catch (err) {
      if (!silent) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load Digital Services.",
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => {
      void load(true);
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (queryTab === "printouts") {
      setTab("printouts");
    } else if (queryTab === "documents") {
      setTab("documents");
    }
  }, [queryTab]);

  useEffect(() => {
    if (!focusId || focusHandled.current === focusId) return;

    const kind: Selected["kind"] =
      queryTab === "printouts" ? "printout" : "document";
    const exists =
      kind === "document"
        ? documents.some((item) => item.id === focusId)
        : printJobs.some((item) => item.id === focusId);

    if (exists) {
      focusHandled.current = focusId;
      setTab(kind === "document" ? "documents" : "printouts");
      setSelected({ kind, id: focusId });
    }
  }, [documents, focusId, printJobs, queryTab]);

  const needle = q.trim().toLowerCase();

  const filteredDocuments = useMemo(
    () =>
      documents.filter((item) => {
        if (statusFilter && item.status !== statusFilter) return false;
        if (!needle) return true;
        return `${item.clientName} ${item.mobile} ${item.clientCode ?? ""} ${
          item.docType
        } ${item.fileName}`
          .toLowerCase()
          .includes(needle);
      }),
    [documents, needle, statusFilter],
  );

  const filteredPrintJobs = useMemo(
    () =>
      printJobs.filter((item) => {
        if (statusFilter && item.status !== statusFilter) return false;
        if (!needle) return true;
        return `${item.clientName} ${item.mobile} ${item.clientCode ?? ""} ${
          item.fileName
        }`
          .toLowerCase()
          .includes(needle);
      }),
    [printJobs, needle, statusFilter],
  );

  const selectedDocument =
    selected?.kind === "document"
      ? documents.find((item) => item.id === selected.id) ?? null
      : null;
  const selectedPrintJob =
    selected?.kind === "printout"
      ? printJobs.find((item) => item.id === selected.id) ?? null
      : null;

  const statusOptions =
    tab === "documents" ? DOCUMENT_STATUSES : PRINT_STATUSES;

  const handleTab = (next: Tab) => {
    setTab(next);
    setStatusFilter("");
    setSelected(null);
  };

  const updateDocumentStatus = async (
    item: AdminDigitalDocument,
    status: AdminDigitalDocumentStatus,
  ) => {
    if (status === item.status) return;
    setBusyId(item.id);
    try {
      await updateAdminDigitalDocument(item.id, { status });
      showToast("Document status updated. Client notified.");
      await load(true);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update document.",
        "error",
      );
    } finally {
      setBusyId(null);
    }
  };

  const updatePrintStatus = async (
    item: AdminPrintJob,
    status: AdminPrintStatus,
  ) => {
    if (status === item.status) return;
    setBusyId(item.id);
    try {
      await updateAdminPrintJob(item.id, { status });
      showToast("Print job status updated. Client notified.");
      await load(true);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update print job.",
        "error",
      );
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.item.id);
    try {
      if (deleteTarget.kind === "document") {
        await deleteAdminDigitalDocument(deleteTarget.item.id);
        showToast("Document deleted. Client notified.");
      } else {
        await deleteAdminPrintJob(deleteTarget.item.id);
        showToast("Print job deleted. Client notified.");
      }
      setDeleteTarget(null);
      setSelected(null);
      await load(true);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not delete request.",
        "error",
      );
    } finally {
      setBusyId(null);
    }
  };

  const kpis = [
    { label: "ID documents", value: stats?.documentsTotal ?? 0 },
    { label: "Pending ID updates", value: stats?.documentsPending ?? 0 },
    { label: "Print jobs", value: stats?.printJobsTotal ?? 0 },
    { label: "Queued print jobs", value: stats?.printJobsQueued ?? 0 },
    { label: "Ready for pickup", value: stats?.printJobsReady ?? 0 },
  ];

  const isEmpty =
    tab === "documents"
      ? filteredDocuments.length === 0
      : filteredPrintJobs.length === 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
            Digital Services
          </p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-charcoal">
            ID updates & printouts
          </h1>
          <p className="mt-1 text-xs text-muted">
            Review uploaded documents, manage print queues and keep clients
            updated.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live · refreshes every 30s
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-border-subtle bg-white p-4"
          >
            <p className="text-xl font-extrabold tracking-tight text-charcoal">
              {kpi.value}
            </p>
            <p className="mt-1 text-[11px] font-semibold leading-tight text-muted">
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-border-subtle bg-ivory p-1">
        {TAB_META.map((item) => {
          const Icon = item.icon;
          const count =
            item.id === "documents" ? documents.length : printJobs.length;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTab(item.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                tab === item.id
                  ? "bg-charcoal text-white"
                  : "text-charcoal hover:bg-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  tab === item.id ? "bg-white/15" : "bg-white"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search by client, KIS id, document or file"
            aria-label="Search Digital Services"
            className="w-full rounded-lg border border-border-subtle bg-white py-2.5 pl-9 pr-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
        </div>
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className={`${inputClass} max-w-[14rem]`}
        >
          <option value="">All statuses</option>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {statusLabel(option)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void load(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm font-bold text-charcoal hover:border-gold/60"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-md border border-rose-300 bg-white px-2.5 py-1 text-[11px] font-bold text-rose-700"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl bg-white"
            />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="rounded-2xl border border-border-subtle bg-white p-10 text-center">
          {tab === "documents" ? (
            <FileText className="mx-auto h-8 w-8 text-gold" />
          ) : (
            <Printer className="mx-auto h-8 w-8 text-gold" />
          )}
          <p className="mt-2 text-sm font-bold text-charcoal">
            No {tab === "documents" ? "ID updates" : "print jobs"} match this
            filter
          </p>
          <p className="mt-1 text-xs text-muted">
            New{" "}
            {tab === "documents"
              ? "document uploads"
              : "print requests from the client app"}{" "}
            appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tab === "documents"
            ? filteredDocuments.map((item) => {
                const active =
                  selected?.kind === "document" && selected.id === item.id;
                return (
                  <div
                    key={item.id}
                    id={`digital-${item.id}`}
                    className={`flex flex-wrap items-start gap-3 rounded-2xl border bg-white p-4 ${
                      active
                        ? "border-gold ring-2 ring-gold/40"
                        : "border-border-subtle"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSelected({ kind: "document", id: item.id })
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={item.status} />
                        <span className="rounded-full bg-ivory px-2 py-0.5 text-[10px] font-bold text-charcoal-light">
                          {item.docType}
                        </span>
                        {item.clientCode && (
                          <span className="rounded-full bg-gold-light px-2 py-0.5 text-[10px] font-extrabold text-[#8a6b1a]">
                            {item.clientCode}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-extrabold text-charcoal">
                        {item.clientName || "Client"}
                      </p>
                      <p className="text-[11px] text-muted">
                        {item.mobile} · {item.fileName} ·{" "}
                        {formatDateTime(item.createdAt)}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold text-muted-light">
                        {item.watermark}
                      </p>
                    </button>
                    <div className="flex shrink-0 items-center gap-2">
                      <select
                        className="rounded-lg border border-border-subtle bg-white px-2.5 py-1.5 text-[11px] font-bold text-charcoal outline-none focus:border-gold"
                        value={item.status}
                        disabled={busyId === item.id}
                        onChange={(event) =>
                          void updateDocumentStatus(
                            item,
                            event.target.value as AdminDigitalDocumentStatus,
                          )
                        }
                        aria-label={`Update ${item.docType} status`}
                      >
                        {DOCUMENT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel(status)}
                          </option>
                        ))}
                      </select>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-border-subtle p-2 text-charcoal hover:border-gold/60"
                          aria-label="Open document"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({ kind: "document", item })
                        }
                        className="rounded-lg border border-border-subtle p-2 text-rose-600 hover:border-rose-300"
                        aria-label="Delete document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            : filteredPrintJobs.map((item) => {
                const active =
                  selected?.kind === "printout" && selected.id === item.id;
                return (
                  <div
                    key={item.id}
                    id={`digital-${item.id}`}
                    className={`flex flex-wrap items-start gap-3 rounded-2xl border bg-white p-4 ${
                      active
                        ? "border-gold ring-2 ring-gold/40"
                        : "border-border-subtle"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSelected({ kind: "printout", id: item.id })
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={item.status} />
                        <span className="rounded-full bg-ivory px-2 py-0.5 text-[10px] font-bold text-charcoal-light">
                          {item.pages} pages × {item.copies} copies
                        </span>
                        {item.clientCode && (
                          <span className="rounded-full bg-gold-light px-2 py-0.5 text-[10px] font-extrabold text-[#8a6b1a]">
                            {item.clientCode}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm font-extrabold text-charcoal">
                        {item.fileName}
                      </p>
                      <p className="text-[11px] text-muted">
                        {item.clientName || "Client"} · {item.mobile} ·{" "}
                        {formatDateTime(item.createdAt)}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold text-muted-light">
                        {item.paperSize} ·{" "}
                        {item.colorMode === "bw" ? "B&W" : "Colour"} ·{" "}
                        {item.sides === "double" ? "Double" : "Single"}-sided ·{" "}
                        {printBindingLabel(item.binding)} ·{" "}
                        {formatINR(item.price)}
                      </p>
                    </button>
                    <div className="flex shrink-0 items-center gap-2">
                      <select
                        className="rounded-lg border border-border-subtle bg-white px-2.5 py-1.5 text-[11px] font-bold text-charcoal outline-none focus:border-gold"
                        value={item.status}
                        disabled={busyId === item.id}
                        onChange={(event) =>
                          void updatePrintStatus(
                            item,
                            event.target.value as AdminPrintStatus,
                          )
                        }
                        aria-label={`Update ${item.fileName} status`}
                      >
                        {PRINT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel(status)}
                          </option>
                        ))}
                      </select>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-border-subtle p-2 text-charcoal hover:border-gold/60"
                          aria-label="Open print file"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({ kind: "printout", item })
                        }
                        className="rounded-lg border border-border-subtle p-2 text-rose-600 hover:border-rose-300"
                        aria-label="Delete print job"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
        </div>
      )}

      {selectedDocument && (
        <DigitalDocumentSheet
          document={selectedDocument}
          busy={busyId === selectedDocument.id}
          onClose={() => setSelected(null)}
          onStatusChange={(status) =>
            void updateDocumentStatus(selectedDocument, status)
          }
          onDelete={() =>
            setDeleteTarget({ kind: "document", item: selectedDocument })
          }
        />
      )}

      {selectedPrintJob && (
        <PrintJobSheet
          job={selectedPrintJob}
          busy={busyId === selectedPrintJob.id}
          onClose={() => setSelected(null)}
          onStatusChange={(status) =>
            void updatePrintStatus(selectedPrintJob, status)
          }
          onDelete={() =>
            setDeleteTarget({ kind: "printout", item: selectedPrintJob })
          }
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={
            deleteTarget.kind === "document"
              ? "Delete this document?"
              : "Delete this print job?"
          }
          message={`Delete "${deleteTarget.item.fileName}" permanently? The client will be notified.`}
          busy={busyId === deleteTarget.item.id}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function DigitalDocumentSheet({
  document,
  busy,
  onClose,
  onStatusChange,
  onDelete,
}: {
  document: AdminDigitalDocument;
  busy: boolean;
  onClose: () => void;
  onStatusChange: (status: AdminDigitalDocumentStatus) => void;
  onDelete: () => void;
}) {
  return (
    <SheetShell
      eyebrow="ID update request"
      title={document.docType}
      subtitle={`${document.clientName || "Client"} · ${document.mobile}`}
      onClose={onClose}
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={document.status} />
        {document.clientCode && (
          <span className="rounded-full bg-gold-light px-2 py-0.5 text-[10px] font-extrabold text-[#8a6b1a]">
            {document.clientCode}
          </span>
        )}
      </div>

      <div className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-white">
        <DetailRow label="Client" value={document.clientName || "Client"} />
        <DetailRow label="Mobile" value={document.mobile} />
        <DetailRow label="Document" value={document.fileName} />
        <DetailRow label="Uploaded" value={formatDateTime(document.createdAt)} />
        <DetailRow label="Watermark" value={document.watermark} />
        <DetailRow label="Request ID" value={document.id} />
      </div>

      <div>
        <label className={labelClass} htmlFor="document-status">
          Update status
        </label>
        <select
          id="document-status"
          className={inputClass}
          value={document.status}
          disabled={busy}
          onChange={(event) =>
            onStatusChange(event.target.value as AdminDigitalDocumentStatus)
          }
        >
          {DOCUMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-[10px] text-muted">
          The client is notified whenever the status changes.
        </p>
      </div>

      <div className="space-y-2">
        {document.url ? (
          <a
            href={document.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-charcoal-light"
          >
            <Download className="h-4 w-4" />
            Open uploaded file
          </a>
        ) : (
          <p className="rounded-lg border border-dashed border-border-subtle p-3 text-center text-xs text-muted">
            File preview is unavailable for this request.
          </p>
        )}
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete request
        </button>
      </div>
    </SheetShell>
  );
}

function PrintJobSheet({
  job,
  busy,
  onClose,
  onStatusChange,
  onDelete,
}: {
  job: AdminPrintJob;
  busy: boolean;
  onClose: () => void;
  onStatusChange: (status: AdminPrintStatus) => void;
  onDelete: () => void;
}) {
  return (
    <SheetShell
      eyebrow="Print job"
      title={job.fileName}
      subtitle={`${job.clientName || "Client"} · ${job.mobile}`}
      onClose={onClose}
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={job.status} />
        {job.clientCode && (
          <span className="rounded-full bg-gold-light px-2 py-0.5 text-[10px] font-extrabold text-[#8a6b1a]">
            {job.clientCode}
          </span>
        )}
        <span className="rounded-full bg-ivory px-2 py-0.5 text-[10px] font-bold text-muted">
          Pickup only
        </span>
      </div>

      <div className="rounded-xl border border-border-subtle bg-ivory p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
          Order value
        </p>
        <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal">
          {formatINR(job.price)}
        </p>
        <p className="mt-0.5 text-[10px] text-muted">
          {job.pages} pages × {job.copies} copies at ₹5/page
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <SpecTile label="Pages" value={String(job.pages)} />
        <SpecTile label="Copies" value={String(job.copies)} />
        <SpecTile label="Paper" value={job.paperSize} />
        <SpecTile
          label="Colour"
          value={job.colorMode === "bw" ? "Black & white" : "Colour"}
        />
        <SpecTile
          label="Sides"
          value={job.sides === "double" ? "Double-sided" : "Single-sided"}
        />
        <SpecTile label="Binding" value={printBindingLabel(job.binding)} />
      </div>

      <div className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-white">
        <DetailRow label="Client" value={job.clientName || "Client"} />
        <DetailRow label="Mobile" value={job.mobile} />
        <DetailRow label="Received" value={formatDateTime(job.createdAt)} />
        <DetailRow
          label="Auto-delete"
          value={job.autoDeletedAt ? formatDateTime(job.autoDeletedAt) : "—"}
        />
        <DetailRow label="Request ID" value={job.id} />
      </div>

      <div>
        <label className={labelClass} htmlFor="print-status">
          Update status
        </label>
        <select
          id="print-status"
          className={inputClass}
          value={job.status}
          disabled={busy}
          onChange={(event) =>
            onStatusChange(event.target.value as AdminPrintStatus)
          }
        >
          {PRINT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-[10px] text-muted">
          The client is notified whenever the status changes.
        </p>
      </div>

      <div className="space-y-2">
        {job.url ? (
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-charcoal-light"
          >
            <Download className="h-4 w-4" />
            Open print file
          </a>
        ) : (
          <p className="rounded-lg border border-dashed border-border-subtle p-3 text-center text-xs text-muted">
            This older print job has no stored file.
          </p>
        )}
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete print job
        </button>
      </div>
    </SheetShell>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2 text-xs">
      <span className="shrink-0 font-semibold text-muted">{label}</span>
      <span className="min-w-0 break-words text-right font-bold text-charcoal">
        {value}
      </span>
    </div>
  );
}

function SpecTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-white p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 text-xs font-extrabold text-charcoal">{value}</p>
    </div>
  );
}
