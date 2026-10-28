import type { ReactNode } from "react";

export interface CalculatorResult {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
}

interface CalculatorPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
  results: CalculatorResult[];
  footer?: ReactNode;
  className?: string;
}

export function CalculatorPanel({
  title,
  description,
  children,
  results,
  footer,
  className = "",
}: CalculatorPanelProps) {
  return (
    <div className={className}>
      <div className="mb-4 space-y-1">
        <h3 className="text-lg font-extrabold text-charcoal tracking-tight">{title}</h3>
        {description && <p className="text-sm text-muted leading-relaxed">{description}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">{children}</div>

        <div className="lg:col-span-2 rounded-2xl bg-charcoal p-5 text-white space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ivory/50">
            Estimate
          </p>
          {results.map((result) => (
            <div key={result.label}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ivory/60">
                {result.label}
              </p>
              <p
                className={
                  result.emphasis
                    ? "text-2xl sm:text-3xl font-extrabold text-gold tracking-tight"
                    : "text-lg font-bold text-white"
                }
              >
                {result.value}
              </p>
              {result.hint && (
                <p className="text-[11px] text-ivory/50 mt-0.5">{result.hint}</p>
              )}
            </div>
          ))}
          {footer && <div className="border-t border-charcoal-light pt-3">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

interface RangeFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  className?: string;
}

export function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = (next) => String(next),
  className = "",
}: RangeFieldProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <label className="text-xs font-bold text-charcoal">{label}</label>
        <span className="text-sm font-extrabold text-charcoal tabular-nums">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-gold cursor-pointer"
      />
      <div className="flex items-center justify-between text-[10px] text-muted-light mt-0.5">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
