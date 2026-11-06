import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-xs font-bold text-foreground mb-1">
        {label} {required && <span className="text-danger-fg">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-danger-fg">{error}</p>}
    </div>
  );
}
