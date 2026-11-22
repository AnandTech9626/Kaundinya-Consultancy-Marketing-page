const BONE = "animate-pulse rounded-md bg-ivory-dark";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`${BONE} ${className}`} />;
}

export function SkeletonKpis({
  count = 4,
  gridClass = "grid-cols-2 sm:grid-cols-4",
}: {
  count?: number;
  gridClass?: string;
}) {
  return (
    <div className={`grid gap-3 ${gridClass}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border-subtle bg-white p-4"
        >
          <Skeleton className="h-6 w-16" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({
  rows = 6,
  columns = 6,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-white">
      <div className="flex gap-3 border-b border-border-subtle bg-ivory/60 px-3 py-2.5">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton
            key={index}
            className={`h-3 flex-1 ${index === 0 ? "max-w-20" : ""}`}
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="flex items-center gap-3 border-t border-border-subtle px-3 py-3"
        >
          {Array.from({ length: columns }).map((_, column) => (
            <Skeleton
              key={column}
              className={`h-3 flex-1 ${
                column === 0 ? "max-w-24" : column === columns - 1 ? "max-w-16" : ""
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-white p-4"
        >
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonRows({
  rows = 4,
  itemClass = "h-16",
}: {
  rows?: number;
  itemClass?: string;
}) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className={`${itemClass} animate-pulse rounded-xl border border-border-subtle bg-ivory/60`}
        />
      ))}
    </div>
  );
}
