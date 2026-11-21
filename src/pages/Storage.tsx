import { useEffect, useRef, useState } from "react";
import {
  Copy,
  Download,
  Eye,
  FileText,
  HardDrive,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { showToast } from "../lib/toast";
import {
  deleteAdminStorageFile,
  fetchAdminStorageFiles,
  fetchAdminStorageUsage,
  getAdminStorageSignedUrl,
  uploadAdminStorageFiles,
  type AdminStorageBucket,
  type AdminStorageObject,
} from "../lib/api";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function baseName(key: string) {
  const parts = key.split("/");
  return parts[parts.length - 1] || key;
}

function extension(key: string) {
  const name = baseName(key);
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toUpperCase() : "FILE";
}

function isImage(key: string) {
  return /\.(jpe?g|png|webp|gif|avif)$/i.test(key);
}

function FileThumb({
  object,
  bucket,
}: {
  object: AdminStorageObject;
  bucket: AdminStorageBucket;
}) {
  const [url, setUrl] = useState<string | null>(
    bucket === "public" ? object.url : null,
  );

  useEffect(() => {
    let cancelled = false;
    setUrl(bucket === "public" ? object.url : null);
    if (bucket === "private" && isImage(object.key)) {
      getAdminStorageSignedUrl("private", object.key)
        .then((signed) => {
          if (!cancelled) setUrl(signed);
        })
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
    };
  }, [bucket, object.key, object.url]);

  if (isImage(object.key) && url) {
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        className="h-9 w-9 shrink-0 rounded-md border border-border-subtle object-cover"
      />
    );
  }

  return isImage(object.key) ? (
    <ImageIcon className="h-4 w-4 shrink-0 text-gold" />
  ) : (
    <FileText className="h-4 w-4 shrink-0 text-muted" />
  );
}

export function Storage() {
  const [bucket, setBucket] = useState<AdminStorageBucket>("public");
  const [objects, setObjects] = useState<AdminStorageObject[]>([]);
  const [configured, setConfigured] = useState(true);
  const [usage, setUsage] = useState<{
    public: { count: number; size: number };
    private: { count: number; size: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ key: string; url: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminStorageObject | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refreshUsage = async () => {
    try {
      const data = await fetchAdminStorageUsage();
      setUsage(data);
    } catch {
      // Usage is best-effort; the file list still works.
    }
  };

  const load = async (
    which: AdminStorageBucket,
    cursor: string | null = null,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminStorageFiles(which, {
        prefix: appliedQuery,
        cursor,
        limit: 10,
      });
      setObjects(data.objects);
      setConfigured(data.configured);
      setCurrentCursor(cursor);
      setNextCursor(data.cursor);
      setTruncated(data.truncated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load storage.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setAppliedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPageIndex(0);
    setCursorStack([]);
    void load(bucket, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket, appliedQuery]);

  useEffect(() => {
    void refreshUsage();
  }, []);

  const counts: Record<AdminStorageBucket, number | null> = {
    public: usage?.public.count ?? null,
    private: usage?.private.count ?? null,
  };
  const sizes: Record<AdminStorageBucket, number | null> = {
    public: usage?.public.size ?? null,
    private: usage?.private.size ?? null,
  };

  const paged = objects;

  const goNext = () => {
    if (!truncated || !nextCursor) return;
    setCursorStack((previous) => [...previous, currentCursor ?? ""]);
    setPageIndex((value) => value + 1);
    void load(bucket, nextCursor);
  };

  const goPrev = () => {
    if (cursorStack.length === 0) return;
    const stack = [...cursorStack];
    const previous = stack.pop();
    setCursorStack(stack);
    setPageIndex((value) => Math.max(0, value - 1));
    void load(bucket, previous ? previous : null);
  };

  const totalCount = appliedQuery ? null : counts[bucket];
  const rangeStart = objects.length === 0 ? 0 : pageIndex * 10 + 1;
  const rangeEnd = objects.length === 0 ? 0 : pageIndex * 10 + objects.length;

  const FREE_TIER_GB = 10;
  const PRICE_PER_GB_USD = 0.015;
  const usedBytes = (sizes.public ?? 0) + (sizes.private ?? 0);
  const usedGb = usedBytes / (1024 ** 3);
  const remainingGb = Math.max(0, FREE_TIER_GB - usedGb);
  const usedPercent = Math.min(100, (usedGb / FREE_TIER_GB) * 100);
  const overageGb = Math.max(0, usedGb - FREE_TIER_GB);
  const monthlyCost = overageGb * PRICE_PER_GB_USD;
  const remainingLabel =
    remainingGb < 1
      ? `${(remainingGb * 1024).toFixed(1)} MB`
      : `${remainingGb.toFixed(2)} GB`;
  const usageLabel =
    usedGb >= 1
      ? `${usedGb.toFixed(2)} GB`
      : `${(usedBytes / (1024 * 1024)).toFixed(1)} MB`;
  const usageTone =
    usedPercent >= 90
      ? "bg-rose-500"
      : usedPercent >= 70
        ? "bg-amber-500"
        : "bg-emerald-500";

  const upload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      await uploadAdminStorageFiles(bucket, Array.from(fileList));
      showToast(`${fileList.length} file(s) uploaded.`);
      await load(bucket, currentCursor);
      await refreshUsage();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not upload files.",
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  const resolveUrl = async (object: AdminStorageObject) => {
    if (bucket === "public") return object.url;
    return getAdminStorageSignedUrl(bucket, object.key);
  };

  const openFile = async (object: AdminStorageObject) => {
    setBusyKey(object.key);
    try {
      const url = await resolveUrl(object);
      if (isImage(object.key)) {
        setPreview({ key: object.key, url });
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not open file.", "error");
    } finally {
      setBusyKey(null);
    }
  };

  const copyFile = async (object: AdminStorageObject) => {
    setBusyKey(object.key);
    try {
      const url = await resolveUrl(object);
      await navigator.clipboard.writeText(url);
      showToast("Link copied.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not copy link.", "error");
    } finally {
      setBusyKey(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyKey(deleteTarget.key);
    try {
      await deleteAdminStorageFile(bucket, deleteTarget.key);
      showToast("File deleted.");
      setDeleteTarget(null);
      await load(bucket, currentCursor);
      await refreshUsage();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not delete file.", "error");
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-charcoal">
            Storage
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Cloudflare R2 files that power property photos, brochures and documents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
              configured
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            <HardDrive className="h-3.5 w-3.5" />
            {configured ? "R2 connected" : "R2 not configured"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        <div className="col-span-2 rounded-xl border border-border-subtle bg-white p-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
              Storage used
            </p>
            <p className="text-[11px] font-bold text-charcoal">
              {usageLabel} / 10 GB
            </p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ivory">
            <div
              className={`h-full rounded-full transition-all ${usageTone}`}
              style={{ width: `${Math.max(usedPercent, usedBytes > 0 ? 1 : 0)}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-muted">
            {usedPercent < 1
              ? usedPercent.toFixed(1)
              : Math.round(usedPercent)}
            % of the 10 GB free tier
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
            Remaining
          </p>
          <p className="mt-0.5 text-lg font-extrabold text-charcoal">
            {remainingLabel}
          </p>
          <p className="text-[10px] text-muted">on free tier</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
            Files
          </p>
          <p className="mt-0.5 text-lg font-extrabold text-charcoal">
            {counts[bucket] ?? objects.length}
          </p>
          <p className="text-[10px] text-muted">
            public {counts.public ?? "-"} · private {counts.private ?? "-"}
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
            Est. monthly
          </p>
          <p className="mt-0.5 text-lg font-extrabold text-charcoal">
            {monthlyCost > 0 ? `$${monthlyCost.toFixed(2)}` : "Free"}
          </p>
          <p className="text-[10px] text-muted">$0.015/GB · egress free</p>
        </div>
      </div>

      <section className="flex min-h-0 flex-col rounded-2xl border border-border-subtle bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-border-subtle bg-ivory p-1">
            {(
              [
                { value: "public", label: "Public" },
                { value: "private", label: "Private" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setBucket(tab.value)}
                className={`rounded-md px-4 py-1.5 text-xs font-bold transition-colors ${
                  bucket === tab.value
                    ? "bg-charcoal text-white"
                    : "text-charcoal hover:bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search files"
                aria-label="Search storage files"
                className="w-full rounded-lg border border-border-subtle bg-white py-2 pl-9 pr-3 text-xs text-charcoal outline-none focus:border-gold"
              />
            </div>
            <button
              type="button"
              onClick={() => void load(bucket)}
              aria-label="Refresh"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle px-2.5 py-2 text-xs font-bold text-charcoal hover:border-gold/60"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-xs font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UploadCloud className="h-3.5 w-3.5" />
              )}
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              accept="image/*,.pdf"
              onChange={(event) => {
                void upload(event.target.files);
                event.target.value = "";
              }}
            />
          </div>
        </div>

        {error ? (
          <div className="mt-3 rounded-xl border border-dashed border-rose-200 bg-rose-50 p-6 text-center">
            <p className="text-sm text-rose-700">{error}</p>
            <button
              type="button"
              onClick={() => void load(bucket)}
              className="mt-2 rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-charcoal"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-border-subtle p-8 text-xs font-semibold text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading files...
          </div>
        ) : objects.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border-subtle p-8 text-center">
            <HardDrive className="mx-auto h-8 w-8 text-gold" />
            <p className="mt-2 text-sm font-bold text-charcoal">No files here yet</p>
            <p className="mt-1 text-xs text-muted">
              Upload images or PDFs and they will appear in this bucket.
            </p>
          </div>
        ) : (
          <>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-border-subtle text-[10px] uppercase tracking-wider text-muted-light">
                  <th className="py-2 pr-3 font-bold">File</th>
                  <th className="px-3 py-2 font-bold">Type</th>
                  <th className="px-3 py-2 font-bold">Size</th>
                  <th className="px-3 py-2 font-bold">Uploaded</th>
                  <th className="py-2 pl-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {paged.map((object) => (
                  <tr key={object.key} className="hover:bg-ivory/40">
                    <td className="max-w-[260px] py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <FileThumb object={object} bucket={bucket} />
                        <div className="min-w-0">
                          <p className="truncate font-bold text-charcoal">
                            {baseName(object.key)}
                          </p>
                          <p className="truncate text-[10px] text-muted">
                            {object.key}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-semibold text-muted">
                      {extension(object.key)}
                    </td>
                    <td className="px-3 py-2 font-semibold text-muted">
                      {formatBytes(object.size)}
                    </td>
                    <td className="px-3 py-2 text-muted">
                      {object.lastModified
                        ? new Date(object.lastModified).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-2 pl-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => void openFile(object)}
                          disabled={busyKey === object.key}
                          aria-label={`Open ${baseName(object.key)}`}
                          title="Open"
                          className="rounded-md p-1.5 text-muted hover:bg-ivory hover:text-charcoal"
                        >
                          {isImage(object.key) ? (
                            <Eye className="h-3.5 w-3.5" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => void copyFile(object)}
                          disabled={busyKey === object.key}
                          aria-label={`Copy link for ${baseName(object.key)}`}
                          title="Copy link"
                          className="rounded-md p-1.5 text-muted hover:bg-ivory hover:text-charcoal"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(object)}
                          disabled={busyKey === object.key}
                          aria-label={`Delete ${baseName(object.key)}`}
                          title="Delete"
                          className="rounded-md p-1.5 text-muted hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-2 text-[11px] text-muted">
            <div className="flex items-center gap-2">
              <span>10 per page</span>
              <span>
                Showing {rangeStart}-{rangeEnd}
                {totalCount !== null ? ` of ${totalCount}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={cursorStack.length === 0}
                className="rounded border border-border-subtle px-2 py-1 font-bold text-charcoal hover:border-gold/60 disabled:opacity-40"
              >
                Prev
              </button>
              <span>Page {pageIndex + 1}</span>
              <button
                type="button"
                onClick={goNext}
                disabled={!truncated || !nextCursor}
                className="rounded border border-border-subtle px-2 py-1 font-bold text-charcoal hover:border-gold/60 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
          </>
        )}
      </section>
      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="File preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/90 p-4"
        >
          <button
            type="button"
            onClick={() => setPreview(null)}
            aria-label="Close preview"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={preview.url}
            alt={baseName(preview.key)}
            className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain"
          />
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-charcoal/60"
            onClick={() => setDeleteTarget(null)}
            aria-hidden="true"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-sm space-y-3 rounded-2xl bg-white p-5 shadow-2xl"
          >
            <h3 className="text-base font-extrabold text-charcoal">
              Delete file?
            </h3>
            <p className="text-xs leading-relaxed text-muted">
              {baseName(deleteTarget.key)} will be permanently removed from the{" "}
              {bucket} bucket.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-bold text-charcoal"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={busyKey === deleteTarget.key}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
