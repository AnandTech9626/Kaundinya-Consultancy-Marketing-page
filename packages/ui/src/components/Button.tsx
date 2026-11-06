import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "dark" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  "inline-flex items-center justify-center font-semibold rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:pointer-events-none gap-2 cursor-pointer";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand hover:bg-brand-hover active:bg-brand-muted text-on-brand shadow-sm focus:ring-brand border border-brand",
  secondary:
    "bg-surface-muted hover:bg-surface-strong text-foreground border border-border focus:ring-brand",
  dark: "bg-inverse hover:bg-inverse-hover active:bg-inverse-strong text-white shadow-sm focus:ring-brand border border-inverse",
  outline:
    "bg-transparent border-2 border-border text-foreground hover:bg-surface-muted focus:ring-brand",
  ghost: "bg-transparent text-foreground hover:bg-surface-muted focus:ring-brand",
};

const sizes: Record<ButtonSize, string> = {
  sm: "text-xs px-3.5 py-2",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-6 py-3.5",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
