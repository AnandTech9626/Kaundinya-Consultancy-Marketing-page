export function formatINR(value: number) {
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

export function formatPropertyPrice(price: number, unit: "month" | "total") {
  const amount = formatINR(price);
  return unit === "month" ? `${amount}/mo` : amount;
}

export function formatArea(sqft: number) {
  return `${sqft.toLocaleString("en-IN")} sq.ft`;
}

export function formatDate(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
