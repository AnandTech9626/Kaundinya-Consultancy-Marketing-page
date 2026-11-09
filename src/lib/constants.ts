import type { AdminServiceRequestStatus } from "./api";

export type ServiceCategory =
  | "Real Estate"
  | "Property Management & Home Services"
  | "Insurance"
  | "Loans";

export const SERVICE_REQUEST_STATUSES: Array<{
  value: AdminServiceRequestStatus;
  label: string;
}> = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  "Property Management & Home Services": "Home Services",
};

export const SERVICE_CATEGORY_STYLES: Record<string, string> = {
  "Real Estate": "border-blue-200 bg-blue-50 text-blue-700",
  "Property Management & Home Services":
    "border-amber-200 bg-amber-50 text-amber-700",
  Insurance: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Loans: "border-violet-200 bg-violet-50 text-violet-700",
};

export const REQUEST_TABS: Array<{
  id: "all" | ServiceCategory;
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "Real Estate", label: "Real Estate" },
  { id: "Property Management & Home Services", label: "Home Services" },
  { id: "Insurance", label: "Insurance" },
  { id: "Loans", label: "Loans" },
];

export const LOAN_TYPES = [
  "Home",
  "Personal",
  "Business",
  "Mortgage",
] as const;

export const LOAN_TYPE_LABELS: Record<string, string> = {
  Home: "Home",
  Personal: "Personal",
  Business: "Business",
  Mortgage: "Mortgage / LAP",
};

export const LOAN_TYPE_CONSULTATION_LABELS: Record<string, string> = {
  Home: "Home loan",
  Personal: "Personal loan",
  Business: "Business loan",
  Mortgage: "Loan against property",
};

export const INCOME_SOURCE_LABELS: Record<string, string> = {
  salaried: "Salaried",
  business: "Business",
};
