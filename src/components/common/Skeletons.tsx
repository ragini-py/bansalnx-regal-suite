import { cn } from "@/lib/utils";

function Bar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-muted", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Bar className="aspect-[4/5] w-full" />
      <Bar className="h-3 w-2/3" />
      <Bar className="h-3 w-1/3" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <Bar className="aspect-[4/5] w-full" />
      <div className="flex flex-col gap-5 pt-6">
        <Bar className="h-3 w-24" />
        <Bar className="h-8 w-3/4" />
        <Bar className="h-4 w-32" />
        <Bar className="h-20 w-full" />
        <Bar className="h-12 w-full" />
        <Bar className="h-12 w-full" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  const colClass =
    cols === 3
      ? "grid-cols-3"
      : cols === 4
        ? "grid-cols-4"
        : cols === 6
          ? "grid-cols-6"
          : "grid-cols-5";
  return (
    <div className="divide-y divide-border border border-border">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className={cn("grid gap-4 p-4", colClass)}>
          {Array.from({ length: cols }).map((__, c) => (
            <Bar key={c} className="h-3 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Bar key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}
