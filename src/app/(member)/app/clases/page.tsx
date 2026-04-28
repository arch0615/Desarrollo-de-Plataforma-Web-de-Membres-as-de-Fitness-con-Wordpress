import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ClassCard, type ClassCardData } from "@/components/classes/class-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata = { title: "Clases" };

type SearchParams = {
  q?: string;
  cat?: string;
  level?: string;
  dur?: string;
};

const LEVELS = [
  { value: "beginner", label: "Principiante" },
  { value: "intermediate", label: "Intermedio" },
  { value: "advanced", label: "Avanzado" },
] as const;

const DURATIONS = [
  { value: "short", label: "Corta (≤15 min)" },
  { value: "medium", label: "Media (15–30 min)" },
  { value: "long", label: "Larga (>30 min)" },
] as const;

function durationFilter(value: string | undefined) {
  switch (value) {
    case "short":
      return { lte: 15 * 60 };
    case "medium":
      return { gt: 15 * 60, lte: 30 * 60 };
    case "long":
      return { gt: 30 * 60 };
    default:
      return undefined;
  }
}

function buildHref(current: SearchParams, override: Partial<SearchParams>) {
  const params = new URLSearchParams();
  const merged = { ...current, ...override };
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `/app/clases?${qs}` : "/app/clases";
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const catSlug = sp.cat ?? "";
  const level = sp.level ?? "";
  const dur = sp.dur ?? "";

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const cat = catSlug ? categories.find((c) => c.slug === catSlug) : undefined;

  const where = {
    status: "published" as const,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(cat ? { categoryId: cat.id } : {}),
    ...(level
      ? { level: level as "beginner" | "intermediate" | "advanced" }
      : {}),
    ...(durationFilter(dur)
      ? { durationSeconds: durationFilter(dur)! }
      : {}),
  };

  const classes = await prisma.class.findMany({
    where,
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: 60,
  });

  const cards: ClassCardData[] = classes.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    durationSeconds: c.durationSeconds,
    level: c.level,
    thumbnailUrl: c.thumbnailUrl,
    category: c.category,
  }));

  const filterActive = !!(q || catSlug || level || dur);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
        Biblioteca
      </h1>
      <p className="mt-1 text-muted-foreground">
        Buscá por título o filtrá por categoría, nivel y duración.
      </p>

      <form className="mt-6 flex gap-2" action="/app/clases">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar clases…"
          className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
        />
        {catSlug && <input type="hidden" name="cat" value={catSlug} />}
        {level && <input type="hidden" name="level" value={level} />}
        {dur && <input type="hidden" name="dur" value={dur} />}
        <button
          type="submit"
          className="rounded-lg border px-3 py-2 text-sm hover:bg-accent"
        >
          Buscar
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <FilterChip
          label="Todas"
          active={!catSlug}
          href={buildHref(sp, { cat: undefined })}
        />
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            label={c.name}
            active={catSlug === c.slug}
            href={buildHref(sp, { cat: c.slug })}
          />
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <FilterChip
          label="Cualquier nivel"
          active={!level}
          href={buildHref(sp, { level: undefined })}
        />
        {LEVELS.map((l) => (
          <FilterChip
            key={l.value}
            label={l.label}
            active={level === l.value}
            href={buildHref(sp, { level: l.value })}
          />
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <FilterChip
          label="Cualquier duración"
          active={!dur}
          href={buildHref(sp, { dur: undefined })}
        />
        {DURATIONS.map((d) => (
          <FilterChip
            key={d.value}
            label={d.label}
            active={dur === d.value}
            href={buildHref(sp, { dur: d.value })}
          />
        ))}
      </div>

      {filterActive && (
        <div className="mt-3">
          <Link
            href="/app/clases"
            className="text-xs text-muted-foreground underline"
          >
            Limpiar filtros
          </Link>
        </div>
      )}

      <div className="mt-6">
        {cards.length === 0 ? (
          <div className="rounded-2xl border p-8 text-center bg-accent/30">
            <p className="font-medium">Sin resultados</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Probá con otra búsqueda o sacá algunos filtros.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {cards.length} {cards.length === 1 ? "clase" : "clases"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {cards.map((c) => (
                <ClassCard key={c.id} c={c} size="sm" />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link href={href} prefetch={false}>
      <Badge
        variant={active ? "default" : "outline"}
        className={cn(
          "cursor-pointer transition-colors",
          !active && "hover:bg-accent",
        )}
      >
        {label}
      </Badge>
    </Link>
  );
}
