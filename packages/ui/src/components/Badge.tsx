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
  neutral: "bg-charcoal/5 text-charcoal border border-border-subtle",
  gold: "bg-gold/15 text-[#8a6b1a] border border-gold/30",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  info: "bg-blue-50 text-blue-700 border border-blue-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  danger: "bg-rose-50 text-rose-700 border border-rose-200",
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
