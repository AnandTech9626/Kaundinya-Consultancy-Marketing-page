import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ className = "", hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-border-subtle shadow-sm ${
        hoverable
          ? "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-gold/60"
          : ""
      } ${className}`}
      {...props}
    />
  );
}
