import { Check } from "lucide-react";

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: StepperStep[];
  current: number;
  orientation?: "horizontal" | "vertical";
  onStepClick?: (index: number) => void;
  className?: string;
}

export function Stepper({
  steps,
  current,
  orientation = "horizontal",
  onStepClick,
  className = "",
}: StepperProps) {
  if (orientation === "vertical") {
    return (
      <ol className={`space-y-0 ${className}`}>
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={step.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${
                    done
                      ? "bg-gold border-gold text-charcoal"
                      : active
                        ? "bg-white border-gold text-charcoal"
                        : "bg-white border-border-subtle text-muted"
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : i + 1}
                </span>
                {i < steps.length - 1 && (
                  <span
                    className={`w-0.5 flex-1 my-1 ${done ? "bg-gold" : "bg-border-subtle"}`}
                  />
                )}
              </div>
              <div className="pb-6">
                <p
                  className={`text-sm font-bold ${
                    active || done ? "text-charcoal" : "text-muted"
                  }`}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-muted mt-0.5">{step.description}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className={`flex items-start overflow-x-auto ${className}`}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const clickable = Boolean(onStepClick);
        return (
          <li
            key={step.id}
            className="flex-1 min-w-[4.5rem] relative flex flex-col items-center text-center"
          >
            {i > 0 && (
              <span
                className={`absolute top-4 left-0 w-1/2 h-0.5 ${
                  i <= current ? "bg-gold" : "bg-border-subtle"
                }`}
              />
            )}
            {i < steps.length - 1 && (
              <span
                className={`absolute top-4 right-0 w-1/2 h-0.5 ${
                  i < current ? "bg-gold" : "bg-border-subtle"
                }`}
              />
            )}
            <button
              type="button"
              onClick={clickable ? () => onStepClick?.(i) : undefined}
              disabled={!clickable}
              aria-current={active ? "step" : undefined}
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                done
                  ? "bg-gold border-gold text-charcoal"
                  : active
                    ? "bg-white border-gold text-charcoal"
                    : "bg-white border-border-subtle text-muted"
              } ${clickable ? "cursor-pointer" : "cursor-default"}`}
            >
              {done ? <Check className="w-4 h-4" /> : i + 1}
            </button>
            <p
              className={`mt-2 text-[11px] sm:text-xs font-semibold px-1 ${
                active || done ? "text-charcoal" : "text-muted"
              }`}
            >
              {step.label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
