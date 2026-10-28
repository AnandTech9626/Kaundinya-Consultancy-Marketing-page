import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "./Button";
import { Stepper } from "./Stepper";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  validate?: () => boolean;
}

interface WizardProps {
  steps: WizardStep[];
  onComplete: () => void;
  submitting?: boolean;
  completeLabel?: string;
  nextLabel?: string;
  backLabel?: string;
  className?: string;
  onStepChange?: (index: number) => void;
}

export function Wizard({
  steps,
  onComplete,
  submitting = false,
  completeLabel = "Submit",
  nextLabel = "Continue",
  backLabel = "Back",
  className = "",
  onStepChange,
}: WizardProps) {
  const [current, setCurrent] = useState(0);
  const step = steps[current];
  const isLast = current === steps.length - 1;
  const canAdvance = step.validate ? step.validate() : true;

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(index, steps.length - 1));
    setCurrent(next);
    onStepChange?.(next);
  };

  const handleNext = () => {
    if (!canAdvance || submitting) return;
    if (isLast) {
      onComplete();
    } else {
      goTo(current + 1);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Stepper
        steps={steps.map((s) => ({ id: s.id, label: s.title }))}
        current={current}
      />

      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
          Step {current + 1} of {steps.length}
        </p>
        <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal tracking-tight">
          {step.title}
        </h2>
        {step.description && (
          <p className="text-sm text-muted leading-relaxed">{step.description}</p>
        )}
      </div>

      <div>{step.content}</div>

      <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-5">
        <Button
          variant="secondary"
          onClick={() => goTo(current - 1)}
          disabled={current === 0 || submitting}
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Button>

        <Button onClick={handleNext} disabled={!canAdvance || submitting}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : isLast ? (
            <>
              <Check className="w-4 h-4" />
              {completeLabel}
            </>
          ) : (
            <>
              {nextLabel}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
