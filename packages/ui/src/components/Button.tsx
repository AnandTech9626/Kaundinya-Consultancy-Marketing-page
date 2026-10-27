import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "dark" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  "inline-flex items-center justify-center font-semibold rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none gap-2 cursor-pointer";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gold hover:bg-gold-hover active:bg-gold-muted text-charcoal shadow-sm focus:ring-gold border border-gold",
  secondary:
    "bg-ivory hover:bg-ivory-dark text-charcoal border border-border-subtle focus:ring-charcoal",
  dark: "bg-charcoal hover:bg-charcoal-light active:bg-charcoal-dark text-white shadow-sm focus:ring-charcoal border border-charcoal",
  outline:
    "bg-transparent border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white focus:ring-charcoal",
  ghost: "bg-transparent text-charcoal hover:bg-ivory focus:ring-charcoal",
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
