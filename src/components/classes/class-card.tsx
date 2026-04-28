import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

const levelLabel = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
} as const;

export type ClassCardData = {
  id: string;
  slug: string;
  title: string;
  durationSeconds: number;
  level: "beginner" | "intermediate" | "advanced";
  thumbnailUrl: string | null;
  category: { name: string };
  progressPct?: number;
};

export function ClassCard({
  c,
  size = "md",
}: {
  c: ClassCardData;
  size?: "sm" | "md";
}) {
  return (
    <Link
      href={`/app/clase/${c.slug}`}
      className={cn(
        "group block rounded-2xl border overflow-hidden bg-background hover:bg-accent/40 transition-colors",
      )}
    >
      <div className="relative aspect-video bg-gradient-to-br from-muted to-muted-foreground/15 grid place-items-center">
        {c.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.thumbnailUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="text-muted-foreground/40 text-xs uppercase tracking-wide">
            {c.category.name}
          </span>
        )}
        {c.progressPct !== undefined && c.progressPct > 0 && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/30">
            <div
              className="h-full bg-foreground"
              style={{ width: `${Math.min(100, Math.max(0, c.progressPct))}%` }}
            />
          </div>
        )}
      </div>
      <div className={cn("p-3", size === "md" && "p-4")}>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {c.category.name} · {formatDuration(c.durationSeconds)}
        </p>
        <p
          className={cn(
            "mt-1 font-medium line-clamp-2",
            size === "sm" ? "text-sm" : "text-base",
          )}
        >
          {c.title}
        </p>
        <div className="mt-2">
          <Badge variant="outline" className="text-[10px] py-0 px-1.5">
            {levelLabel[c.level]}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
