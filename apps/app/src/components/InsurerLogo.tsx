import { insurerBrand } from "../lib/insuranceUi";

export function InsurerLogo({
  insurer,
  size = 34,
  className = "",
}: {
  insurer: string;
  size?: number;
  className?: string;
}) {
  const brand = insurerBrand(insurer);
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg font-extrabold ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: brand.background,
        color: brand.foreground,
        fontSize: Math.max(8, Math.round(size * 0.28)),
        letterSpacing: "0.02em",
      }}
      aria-label={insurer}
      title={insurer}
    >
      {brand.short}
    </span>
  );
}
