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
}: {
  size?: BrandSize;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`} style={{ fontFamily: "Manrope, sans-serif" }}>
      <img
        src={BRAND_MARK_URL}
        alt="Kaundinya"
        className={`${ICON_HEIGHT[size]} w-auto shrink-0 object-contain`}
      />
      <div className="flex min-w-0 flex-col">
        <span
          className={`font-extrabold leading-none tracking-[0.12em] text-gold ${TITLE_SIZE[size]}`}
        >
          KAUNDINYA
        </span>
        <span
          className={`mt-1 flex w-full justify-between font-bold leading-none text-gold ${SUBTITLE_SIZE[size]}`}
          aria-label="Integrated Services"
        >
          {"INTEGRATED SERVICES".split("").map((character, index) =>
            character === " " ? (
              <span key={index} className="w-[0.6em]" aria-hidden="true" />
            ) : (
              <span key={index} aria-hidden="true">
                {character}
              </span>
            ),
          )}
        </span>
      </div>
    </div>
  );
}
