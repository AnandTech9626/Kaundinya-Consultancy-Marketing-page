import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
}

export function StatCard({ label, value, icon, hint }: StatCardProps) {
  return (
    <div className="bg-surface rounded-2xl border border-border shadow-sm p-5 flex items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          {value}
        </p>
        {hint && <p className="text-xs text-subtle-foreground">{hint}</p>}
      </div>
      {icon && (
        <div className="w-11 h-11 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}
    </div>
  );
}
