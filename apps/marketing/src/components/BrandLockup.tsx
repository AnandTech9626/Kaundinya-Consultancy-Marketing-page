type BrandSize = "sm" | "md" | "lg";

const ICON_HEIGHT: Record<BrandSize, string> = {
  sm: "h-10",
  md: "h-16",
  lg: "h-24",
};

const TITLE_SIZE: Record<BrandSize, string> = {
  sm: "text-[14px]",
  md: "text-[20px]",
  lg: "text-3xl",
};

const SUBTITLE_SIZE: Record<BrandSize, string> = {
  sm: "text-[7px]",
  md: "text-[10px]",
  lg: "text-[12px]",
};

const SUBTITLE_CHARS = "INTEGRATED SERVICES".split("");

export function BrandLockup({
  size = "md",
  className = "",
}: {
  size?: BrandSize;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      <img
        src="/images/brand-mark.webp"
        alt="Kaundinya"
        className={`${ICON_HEIGHT[size]} w-auto shrink-0 object-contain`}
        width="64"
        height="64"
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
          {SUBTITLE_CHARS.map((character, index) =>
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
