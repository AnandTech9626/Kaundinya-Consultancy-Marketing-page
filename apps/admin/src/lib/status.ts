import type { EnquiryStatus, Priority, RequestStatus } from "@kaundinya/config";
import type { BadgeVariant } from "@kaundinya/ui";

export const ENQUIRY_STATUS: Record<
  EnquiryStatus,
  { label: string; badge: BadgeVariant }
> = {
  new: { label: "New", badge: "gold" },
  contacted: { label: "Contacted", badge: "info" },
  qualified: { label: "Qualified", badge: "warning" },
  converted: { label: "Converted", badge: "success" },
  lost: { label: "Lost", badge: "danger" },
};

export const ENQUIRY_STATUS_ORDER: EnquiryStatus[] = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
];

export const PRIORITY: Record<Priority, { label: string; badge: BadgeVariant }> = {
  high: { label: "High", badge: "danger" },
  medium: { label: "Medium", badge: "warning" },
  low: { label: "Low", badge: "neutral" },
};

export const REQUEST_STATUS: Record<
  RequestStatus,
  { label: string; badge: BadgeVariant }
> = {
  new: { label: "New", badge: "gold" },
  in_progress: { label: "In Progress", badge: "info" },
  completed: { label: "Completed", badge: "success" },
  cancelled: { label: "Cancelled", badge: "neutral" },
};
