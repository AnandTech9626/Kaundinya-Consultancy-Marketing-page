import { useState } from "react";
import { Badge, Card, PipelineBoard, Skeleton } from "@kaundinya/ui";
import type { PipelineColumn, PipelineItem, PipelineTone } from "@kaundinya/ui";
import {
  MODULE_META,
  MODULE_STAGES,
  type ServiceCategoryId,
} from "@kaundinya/config";
import { fetchPipeline, updatePipelineStatus } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { useStaff } from "../lib/staff";
import { formatDate } from "../lib/formats";

const MODULES = Object.keys(MODULE_META) as ServiceCategoryId[];
const TONES: PipelineTone[] = ["gold", "info", "warning", "success", "neutral"];

export function Pipeline() {
  const [module, setModule] = useState<ServiceCategoryId>("real-estate");
  const { data, loading, error, refetch } = useAsync(
    () => fetchPipeline(module),
    [module]
  );

  const records = data ?? [];
  const stages = MODULE_STAGES[module];
  const staff = useStaff();
  const staffName = (id: string | null) =>
    id ? staff.find((member) => member.id === id)?.name ?? "Unknown" : "Unassigned";

  const columns: PipelineColumn[] = stages.map((stage, index) => ({
    id: stage.id,
    label: stage.label,
    tone: TONES[index % TONES.length],
    items: records
      .filter((record) => record.status === stage.id)
      .map((record) => ({
        id: record.id,
        title: record.title,
        subtitle: record.clientName,
        meta: formatDate(record.createdAt),
        assignee: staffName(record.assignedTo),
        badge: record.value ? <Badge variant="gold">{record.value}</Badge> : undefined,
      })),
  }));

  const advance = async (item: PipelineItem) => {
    const record = records.find((entry) => entry.id === item.id);
    if (!record) return;
    const index = stages.findIndex((stage) => stage.id === record.status);
    if (index === -1 || index >= stages.length - 1) return;
    await updatePipelineStatus(record.id, stages[index + 1].id);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Pipeline
          </h1>
          <p className="text-muted mt-1">
            {MODULE_META[module].description}
          </p>
        </div>
        <p className="text-[11px] text-muted-light">
          Click a card to move it to the next stage.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MODULES.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setModule(id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
              module === id
                ? "bg-charcoal text-white"
                : "bg-white text-charcoal border border-border-subtle hover:border-muted"
            }`}
          >
            {MODULE_META[id].shortName}
          </button>
        ))}
      </div>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load the pipeline.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      ) : loading ? (
        <div className="flex gap-3 overflow-hidden">
          {stages.slice(0, 4).map((stage) => (
            <Card key={stage.id} className="w-72 shrink-0 p-3 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <PipelineBoard
          columns={columns}
          onItemClick={(item) => void advance(item)}
          emptyLabel="No open items"
        />
      )}
    </div>
  );
}
