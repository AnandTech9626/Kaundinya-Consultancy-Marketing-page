import { useEffect, useState } from "react";
import { bankBrand } from "../lib/bankBrand";

export function BankLogo({
  bank,
  size = 32,
  className = "",
}: {
  bank: string;
  size?: number;
  className?: string;
}) {
  const brand = bankBrand(bank);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [brand.logo]);

  const boxStyle = { width: size, height: size };

  if (brand.logo && !failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white ${className}`}
        style={boxStyle}
        aria-label={`${bank} logo`}
      >
        <img
          src={brand.logo}
          alt={`${bank} logo`}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ width: "82%", height: "82%", objectFit: "contain" }}
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg font-extrabold ${className}`}
      style={{
        ...boxStyle,
        backgroundColor: brand.background,
        color: brand.foreground,
        fontSize: Math.max(9, Math.round(size * 0.32)),
      }}
      aria-label={bank}
    >
      {brand.short}
    </span>
  );
}
