import { Skeleton } from "@/components/ui/skeleton";
import { ClassRowSkeleton } from "@/components/classes/class-card-skeleton";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-10 space-y-10">
      <header className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </header>
      <ClassRowSkeleton title="Recién agregadas" />
      <ClassRowSkeleton title="Flexibilidad" />
      <ClassRowSkeleton title="Movilidad" />
    </div>
  );
}
