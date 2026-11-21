import { BRAND_MARK_URL } from "../lib/brand";

type BrandSize = "md" | "lg";

const ICON_HEIGHT: Record<BrandSize, string> = {
  md: "h-16",
  lg: "h-24",
};

const TITLE_SIZE: Record<BrandSize, string> = {
  md: "text-[20px]",
  lg: "text-3xl",
};

const SUBTITLE_SIZE: Record<BrandSize, string> = {
  md: "text-[10px]",
  lg: "text-[12px]",
};

export function BrandLockup({
  size = "md",
  className = "",
  collapsed = false,
}: {
  size?: BrandSize;
  className?: string;
  collapsed?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1 ${collapsed ? "lg:justify-center" : ""} ${className}`}
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      <img
        src={BRAND_MARK_URL}
        alt="Kaundinya"
        className={`${ICON_HEIGHT[size]} w-auto shrink-0 object-contain`}
      />
      <div className={`flex min-w-0 flex-col ${collapsed ? "lg:hidden" : ""}`}>
        <span
          className={`font-extrabold leading-none tracking-[0.12em] text-brand ${TITLE_SIZE[size]}`}
        >
          KAUNDINYA
        </span>
        <span
          className={`mt-1 whitespace-nowrap font-bold uppercase leading-none tracking-[0.22em] text-brand ${SUBTITLE_SIZE[size]}`}
        >
          Integrated Services
        </span>
      </div>
    </div>
  );
}
