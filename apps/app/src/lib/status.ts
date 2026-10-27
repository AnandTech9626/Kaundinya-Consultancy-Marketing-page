import type { RequestStatus } from "@kaundinya/config";
import type { BadgeVariant } from "@kaundinya/ui";

export const STATUS_META: Record<
  RequestStatus,
  { label: string; badge: BadgeVariant }
> = {
  new: { label: "New", badge: "gold" },
  in_progress: { label: "In Progress", badge: "info" },
  completed: { label: "Completed", badge: "success" },
  cancelled: { label: "Cancelled", badge: "neutral" },
};

export const STATUS_ORDER: RequestStatus[] = [
  "new",
  "in_progress",
  "completed",
];
