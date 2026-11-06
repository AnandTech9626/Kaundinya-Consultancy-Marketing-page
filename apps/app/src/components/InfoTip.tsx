import { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";

interface InfoTipProps {
  text: string;
  label?: string;
  className?: string;
}

export function InfoTip({
  text,
  label = "More information",
  className = "",
}: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <span
      ref={wrapperRef}
      className={`relative inline-flex shrink-0 ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={(event) => {
          if (
            !wrapperRef.current?.contains(event.relatedTarget as Node | null)
          ) {
            setOpen(false);
          }
        }}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 cursor-pointer"
      >
        <Info className="h-4 w-4" />
      </button>

      {open && (
        <span
          role="tooltip"
          id={tooltipId}
          className="absolute left-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface p-3 text-left text-[11px] font-medium leading-relaxed text-foreground-soft shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}
