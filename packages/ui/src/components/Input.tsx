import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const controlBase =
  "w-full px-3.5 py-2.5 rounded-lg border text-sm text-foreground placeholder:text-subtle-foreground bg-surface transition-all focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand";

function controlClass(invalid: boolean, className: string) {
  const state = invalid
    ? "border-danger-fg bg-danger-soft/20"
    : "border-border hover:border-subtle-foreground";
  return `${controlBase} ${state} ${className}`;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", invalid = false, ...props },
  ref
) {
  return <input ref={ref} className={controlClass(invalid, className)} {...props} />;
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = "", invalid = false, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={`${controlClass(invalid, className)} cursor-pointer`}
      {...props}
    />
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = "", invalid = false, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={`${controlClass(invalid, className)} resize-none`}
      {...props}
    />
  );
});
