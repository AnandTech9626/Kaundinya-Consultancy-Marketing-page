import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ className = "", hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-2xl border border-border shadow-sm ${
        hoverable
          ? "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-brand/60"
          : ""
      } ${className}`}
      {...props}
    />
  );
}
