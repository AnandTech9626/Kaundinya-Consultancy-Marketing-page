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
  gold: "bg-brand",
  info: "bg-info-soft0",
  success: "bg-success-soft0",
  warning: "bg-warning-soft0",
  danger: "bg-danger-soft0",
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
          className="w-72 shrink-0 flex flex-col rounded-2xl border border-border bg-surface-muted/60 overflow-hidden"
        >
          <header className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-border bg-surface">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${TONES[column.tone ?? "neutral"]}`}
              />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground truncate">
                {column.label}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
              {column.items.length}
            </span>
          </header>

          <div className="flex-1 p-2.5 space-y-2.5">
            {column.items.length === 0 ? (
              <p className="text-[11px] text-subtle-foreground text-center py-6">
                {emptyLabel}
              </p>
            ) : (
              column.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={onItemClick ? () => onItemClick(item, column) : undefined}
                  className={`w-full text-left rounded-xl border border-border bg-surface p-3 transition-all ${
                    onItemClick
                      ? "hover:border-brand/60 hover:shadow-sm cursor-pointer"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-foreground leading-snug">
                      {item.title}
                    </p>
                    {item.badge}
                  </div>
                  {item.subtitle && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.subtitle}</p>
                  )}
                  {(item.meta || item.assignee !== undefined) && (
                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-subtle-foreground">
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
