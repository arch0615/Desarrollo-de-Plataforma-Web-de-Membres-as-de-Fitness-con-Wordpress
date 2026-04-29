import { Skeleton } from "@/components/ui/skeleton";

export function ClassCardSkeleton({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <div className="rounded-2xl border overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className={size === "sm" ? "p-3 space-y-2" : "p-4 space-y-2"}>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function ClassRowSkeleton({ title }: { title: string }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ClassCardSkeleton key={i} size="sm" />
        ))}
      </div>
    </section>
  );
}
