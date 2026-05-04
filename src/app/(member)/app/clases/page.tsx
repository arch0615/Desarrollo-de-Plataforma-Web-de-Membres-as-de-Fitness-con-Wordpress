import Link from "next/link";
import { Search, X, Library as LibraryIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ClassCard, type ClassCardData } from "@/components/classes/class-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requireActiveAccess } from "@/lib/access";

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
  await requireActiveAccess();
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
      <header>
        <Badge
          variant="secondary"
          className="bg-brand-coral/10 text-brand-coral border-0"
        >
          <LibraryIcon className="size-3.5" />
          Biblioteca
        </Badge>
        <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
          Encontrá tu{" "}
          <span className="text-gradient-sunset">próxima clase</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Buscá por título o filtrá por categoría, nivel y duración.
        </p>
      </header>

      <form className="mt-7 flex gap-2" action="/app/clases">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar clases…"
            className="w-full rounded-xl border bg-card pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral/30 focus:border-brand-coral transition-all"
          />
        </div>
        {catSlug && <input type="hidden" name="cat" value={catSlug} />}
        {level && <input type="hidden" name="level" value={level} />}
        {dur && <input type="hidden" name="dur" value={dur} />}
        <button
          type="submit"
          className="rounded-xl bg-sunset border-0 text-white px-5 py-2.5 text-sm font-semibold shadow-md shadow-brand-coral/25 hover:opacity-95 hover:shadow-brand-coral/40 transition-all"
        >
          Buscar
        </button>
      </form>

      <div className="mt-6 space-y-2">
        <div className="flex flex-wrap gap-1.5">
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

        <div className="flex flex-wrap gap-1.5">
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

        <div className="flex flex-wrap gap-1.5">
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
      </div>

      {filterActive && (
        <div className="mt-4">
          <Link
            href="/app/clases"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-coral hover:underline"
          >
            <X className="size-3" />
            Limpiar filtros
          </Link>
        </div>
      )}

      <div className="mt-8">
        {cards.length === 0 ? (
          <div className="relative rounded-3xl border-2 border-dashed border-brand-coral/30 bg-brand-coral/5 p-10 text-center">
            <div className="size-12 mx-auto rounded-2xl bg-sunset grid place-items-center shadow-lg shadow-brand-coral/30">
              <Search className="size-5 text-white" />
            </div>
            <p className="mt-4 font-semibold text-lg">Sin resultados</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              Probá con otra búsqueda o sacá algunos filtros.
            </p>
            {filterActive && (
              <Link
                href="/app/clases"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "mt-5 bg-sunset border-0 text-white shadow-md shadow-brand-coral/25 hover:opacity-95",
                )}
              >
                Limpiar filtros
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-5">
              <span className="font-bold text-foreground">{cards.length}</span>{" "}
              {cards.length === 1 ? "clase" : "clases"}
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
        className={cn(
          "cursor-pointer transition-all border-0",
          active
            ? "bg-sunset text-white shadow-sm shadow-brand-coral/25 hover:opacity-95"
            : "bg-secondary text-muted-foreground hover:bg-brand-coral/10 hover:text-brand-coral",
        )}
      >
        {label}
      </Badge>
    </Link>
  );
}
