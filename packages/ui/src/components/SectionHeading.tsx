interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  dark?: boolean;
  className?: string;
}

export function SectionHeading({
  badge,
  title,
  subtitle,
  centered = false,
  dark = false,
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={`space-y-3 ${centered ? "text-center mx-auto max-w-3xl" : "max-w-2xl"} ${className}`}
    >
      {badge && (
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-gold">
          {badge}
        </span>
      )}
      <h2
        className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
          dark ? "text-white" : "text-charcoal"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-base sm:text-lg leading-relaxed ${
            dark ? "text-ivory/80" : "text-muted"
          }`}
        >
          {subtitle}
        </p>
      )}
      <div className={`h-1 w-12 bg-gold rounded-full ${centered ? "mx-auto" : ""}`} />
    </div>
  );
}
