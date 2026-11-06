import type { HTMLAttributes } from "react";

export type BadgeVariant =
  | "neutral"
  | "gold"
  | "success"
  | "info"
  | "warning"
  | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const styles: Record<BadgeVariant, string> = {
  neutral: "bg-surface-muted text-muted-foreground border border-border",
  gold: "bg-brand/15 text-brand-strong border border-brand/30",
  success: "bg-success-soft text-success-fg border border-success-fg/20",
  info: "bg-info-soft text-info-fg border border-info-fg/20",
  warning: "bg-warning-soft text-warning-fg border border-warning-fg/20",
  danger: "bg-danger-soft text-danger-fg border border-danger-fg/20",
};

export function Badge({
  variant = "neutral",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
