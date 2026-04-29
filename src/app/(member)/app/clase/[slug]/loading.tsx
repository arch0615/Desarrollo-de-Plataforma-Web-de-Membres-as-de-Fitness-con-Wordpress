import { Skeleton } from "@/components/ui/skeleton";

export default function ClassDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 aspect-video w-full rounded-2xl" />
      <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <aside className="space-y-3">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full rounded-2xl" />
          ))}
        </aside>
      </div>
    </div>
  );
}
