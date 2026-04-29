import { Skeleton } from "@/components/ui/skeleton";
import { ClassCardSkeleton } from "@/components/classes/class-card-skeleton";

export default function LibraryLoading() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-10">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-72" />
      <Skeleton className="mt-6 h-10 w-full max-w-md" />
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <ClassCardSkeleton key={i} size="sm" />
        ))}
      </div>
    </div>
  );
}
