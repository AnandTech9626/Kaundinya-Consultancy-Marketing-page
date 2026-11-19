import type { BadgeVariant } from "@kaundinya/ui";

const DANGER = /(cancel|reject|fail|laps|expir|overdue|declin|error|blocked)/;
const WARNING =
  /(pending|new|request|draft|await|review|hold|renew|incomplete)/;
const INFO =
  /(progress|assign|process|contact|confirm|schedule|route|submit|verif|issue|open)/;
const SUCCESS =
  /(complete|active|approve|disburse|sold|rented|paid|success|closed|done|resolved)/;

/** Humanizes any status value coming from the API (snake_case, kebab, etc.). */
export function humanizeStatus(status: string | null | undefined): string {
  const cleaned = String(status ?? "")
    .replace(/[_-]+/g, " ")
    .trim();
  if (!cleaned) return "Unknown";
  return cleaned.replace(/\b\w/g, (character) => character.toUpperCase());
}

/**
 * Derives a badge tone from the status value itself. No per-status table:
 * any new status the admin starts using renders with a sensible tone.
 */
export function statusVariant(status: string | null | undefined): BadgeVariant {
  const value = String(status ?? "").toLowerCase();
  if (!value) return "neutral";
  if (DANGER.test(value)) return "danger";
  if (WARNING.test(value)) return "warning";
  if (INFO.test(value)) return "info";
  if (SUCCESS.test(value)) return "success";
  return "neutral";
}

export function statusMeta(status: string | null | undefined): {
  label: string;
  badge: BadgeVariant;
} {
  return { label: humanizeStatus(status), badge: statusVariant(status) };
}

export const statusLabel = (status: string | null | undefined) =>
  humanizeStatus(status);

export const statusBadge = (status: string | null | undefined) =>
  statusVariant(status);

/** Order used by request timelines; unknown statuses are appended by the caller. */
export const STATUS_ORDER: string[] = ["new", "in_progress", "completed"];
