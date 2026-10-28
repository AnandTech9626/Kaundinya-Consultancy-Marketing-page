import { CheckCircle2, Circle, CircleDot, XCircle } from "lucide-react";

export interface TimelineStage {
  id: string;
  label: string;
  description?: string;
  at?: string;
}

interface StatusTimelineProps {
  stages: TimelineStage[];
  currentId?: string | null;
  cancelled?: boolean;
  className?: string;
}

export function StatusTimeline({
  stages,
  currentId,
  cancelled = false,
  className = "",
}: StatusTimelineProps) {
  const currentIndex = stages.findIndex((stage) => stage.id === currentId);
  const activeIndex = cancelled ? -1 : Math.max(0, currentIndex);

  return (
    <div className={className}>
      {cancelled && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700 font-medium">
            This request was cancelled. Contact us if you would like to reopen it.
          </p>
        </div>
      )}

      <div className="space-y-0">
        {stages.map((stage, i) => {
          const reached = !cancelled && i <= activeIndex;
          const isCurrent = !cancelled && i === activeIndex;
          const isLast = i === stages.length - 1;
          return (
            <div key={stage.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                {reached ? (
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-border-subtle shrink-0" />
                )}
                {!isLast && (
                  <span
                    className={`w-0.5 flex-1 my-1 ${
                      !cancelled && i < activeIndex ? "bg-gold" : "bg-border-subtle"
                    }`}
                  />
                )}
              </div>
              <div className={`flex-1 ${isLast ? "pb-0" : "pb-6"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <p
                    className={`text-sm font-bold ${
                      isCurrent ? "text-charcoal" : reached ? "text-charcoal-light" : "text-muted"
                    }`}
                  >
                    {stage.label}
                  </p>
                  {stage.at && (
                    <span className="text-[11px] text-muted-light whitespace-nowrap">
                      {stage.at}
                    </span>
                  )}
                </div>
                {stage.description && (
                  <p className="text-xs text-muted mt-0.5">{stage.description}</p>
                )}
                {isCurrent && (
                  <p className="text-xs text-muted flex items-center gap-1 mt-1">
                    <CircleDot className="w-3 h-3 text-gold" />
                    Current stage
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
