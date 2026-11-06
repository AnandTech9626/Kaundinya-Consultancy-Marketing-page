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
                      ? "bg-brand border-brand text-on-brand"
                      : active
                        ? "bg-surface border-brand text-foreground"
                        : "bg-surface border-border text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : i + 1}
                </span>
                {i < steps.length - 1 && (
                  <span
                    className={`w-0.5 flex-1 my-1 ${done ? "bg-brand" : "bg-border"}`}
                  />
                )}
              </div>
              <div className="pb-6">
                <p
                  className={`text-sm font-bold ${
                    active || done ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
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
                  i <= current ? "bg-brand" : "bg-border"
                }`}
              />
            )}
            {i < steps.length - 1 && (
              <span
                className={`absolute top-4 right-0 w-1/2 h-0.5 ${
                  i < current ? "bg-brand" : "bg-border"
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
                  ? "bg-brand border-brand text-on-brand"
                  : active
                    ? "bg-surface border-brand text-foreground"
                    : "bg-surface border-border text-muted-foreground"
              } ${clickable ? "cursor-pointer" : "cursor-default"}`}
            >
              {done ? <Check className="w-4 h-4" /> : i + 1}
            </button>
            <p
              className={`mt-2 text-[11px] sm:text-xs font-semibold px-1 ${
                active || done ? "text-foreground" : "text-muted-foreground"
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
