import { useRef, useState, type DragEvent } from "react";
import { AlertCircle, FileText, Image as ImageIcon, UploadCloud, X } from "lucide-react";

interface FileDropzoneProps {
  files: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  label?: string;
  hint?: string;
  className?: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true;
  return accept.split(",").some((raw) => {
    const rule = raw.trim().toLowerCase();
    if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule);
    if (rule.endsWith("/*")) return file.type.startsWith(rule.slice(0, -1));
    return file.type === rule;
  });
}

export function FileDropzone({
  files,
  onChange,
  accept,
  multiple = true,
  maxSizeMb = 10,
  label = "Upload documents",
  hint = "JPG, PNG or PDF. Images are compressed automatically.",
  className = "",
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const incoming = Array.from(list);
    const tooLarge = incoming.filter((f) => f.size > maxSizeMb * 1024 * 1024);
    const wrongType = incoming.filter((f) => !matchesAccept(f, accept));
    const accepted = incoming.filter(
      (f) => f.size <= maxSizeMb * 1024 * 1024 && matchesAccept(f, accept)
    );

    if (tooLarge.length > 0) {
      setError(`${tooLarge[0].name} is larger than ${maxSizeMb} MB.`);
    } else if (wrongType.length > 0) {
      setError(`${wrongType[0].name} is not an accepted file type.`);
    } else {
      setError(null);
    }

    if (accepted.length === 0) return;
    onChange(multiple ? [...files, ...accepted] : accepted.slice(0, 1));
  };

  const remove = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
    setError(null);
  };

  const openPicker = () => inputRef.current?.click();

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors cursor-pointer ${
          dragging
            ? "border-gold bg-gold-light/60"
            : "border-border-subtle bg-ivory-light hover:border-gold/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <div className="w-10 h-10 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center mx-auto">
          <UploadCloud className="w-5 h-5" />
        </div>
        <p className="mt-2 text-sm font-bold text-charcoal">{label}</p>
        <p className="text-xs text-muted mt-0.5">
          Drag and drop or <span className="font-bold text-gold">browse</span>
        </p>
        <p className="text-[11px] text-muted-light mt-1">{hint}</p>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-[11px] text-rose-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            const Icon = isImage ? ImageIcon : FileText;
            return (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-3 py-2"
              >
                <Icon className="w-4 h-4 text-muted shrink-0" />
                <span className="flex-1 min-w-0 text-xs font-medium text-charcoal truncate">
                  {file.name}
                </span>
                <span className="text-[11px] text-muted-light whitespace-nowrap">
                  {formatSize(file.size)}
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    remove(index);
                  }}
                  aria-label={`Remove ${file.name}`}
                  className="p-1 rounded-md text-muted hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
