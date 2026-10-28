import type { ReactNode } from "react";

export type PipelineTone = "neutral" | "gold" | "info" | "success" | "warning" | "danger";

export interface PipelineItem {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  assignee?: string | null;
  badge?: ReactNode;
}

export interface PipelineColumn {
  id: string;
  label: string;
  items: PipelineItem[];
  tone?: PipelineTone;
}

interface PipelineBoardProps {
  columns: PipelineColumn[];
  onItemClick?: (item: PipelineItem, column: PipelineColumn) => void;
  emptyLabel?: string;
  className?: string;
}

const TONES: Record<PipelineTone, string> = {
  neutral: "bg-muted-light",
  gold: "bg-gold",
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
};

export function PipelineBoard({
  columns,
  onItemClick,
  emptyLabel = "Nothing here yet",
  className = "",
}: PipelineBoardProps) {
  return (
    <div className={`flex gap-3 overflow-x-auto pb-2 ${className}`}>
      {columns.map((column) => (
        <section
          key={column.id}
          className="w-72 shrink-0 flex flex-col rounded-2xl border border-border-subtle bg-ivory/60 overflow-hidden"
        >
          <header className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-border-subtle bg-white">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${TONES[column.tone ?? "neutral"]}`}
              />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal truncate">
                {column.label}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-muted tabular-nums">
              {column.items.length}
            </span>
          </header>

          <div className="flex-1 p-2.5 space-y-2.5">
            {column.items.length === 0 ? (
              <p className="text-[11px] text-muted-light text-center py-6">
                {emptyLabel}
              </p>
            ) : (
              column.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={onItemClick ? () => onItemClick(item, column) : undefined}
                  className={`w-full text-left rounded-xl border border-border-subtle bg-white p-3 transition-all ${
                    onItemClick
                      ? "hover:border-gold/60 hover:shadow-sm cursor-pointer"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-charcoal leading-snug">
                      {item.title}
                    </p>
                    {item.badge}
                  </div>
                  {item.subtitle && (
                    <p className="text-xs text-muted mt-0.5 truncate">{item.subtitle}</p>
                  )}
                  {(item.meta || item.assignee !== undefined) && (
                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-light">
                      <span className="truncate">{item.meta}</span>
                      <span className="whitespace-nowrap">
                        {item.assignee ?? "Unassigned"}
                      </span>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
