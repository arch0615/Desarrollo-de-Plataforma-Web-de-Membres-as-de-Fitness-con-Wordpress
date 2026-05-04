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
        "group block rounded-2xl border overflow-hidden bg-card transition-all hover:shadow-xl hover:shadow-brand-plum/10 hover:-translate-y-0.5",
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-sunset grid place-items-center">
        {c.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.thumbnailUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="text-white/90 text-xs font-bold uppercase tracking-widest">
            {c.category.name}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {c.progressPct !== undefined && c.progressPct > 0 && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40">
            <div
              className="h-full bg-sunset"
              style={{ width: `${Math.min(100, Math.max(0, c.progressPct))}%` }}
            />
          </div>
        )}
      </div>
      <div className={cn("p-3", size === "md" && "p-4")}>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-brand-coral">
          {c.category.name} · {formatDuration(c.durationSeconds)}
        </p>
        <p
          className={cn(
            "mt-1.5 font-semibold line-clamp-2 group-hover:text-brand-coral transition-colors",
            size === "sm" ? "text-sm" : "text-base",
          )}
        >
          {c.title}
        </p>
        <div className="mt-2">
          <Badge
            variant="outline"
            className="text-[10px] py-0 px-2 border-brand-coral/30 text-brand-coral bg-brand-coral/5"
          >
            {levelLabel[c.level]}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
