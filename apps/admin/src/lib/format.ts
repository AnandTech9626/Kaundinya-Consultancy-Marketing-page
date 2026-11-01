export function formatINR(value: number): string {
  if (value >= 10000000) {
    const crore = value / 10000000;
    return `₹${crore % 1 === 0 ? crore : crore.toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    const lakh = value / 100000;
    return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(2)} L`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatPrice(value: number, unit: "month" | "total"): string {
  return unit === "month" ? `${formatINR(value)}/mo` : formatINR(value);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
