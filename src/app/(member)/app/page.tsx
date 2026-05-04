import Link from "next/link";
import { Flame, Library, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireActiveAccess } from "@/lib/access";
import { ClassRow } from "@/components/classes/class-row";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ClassCardData } from "@/components/classes/class-card";

export const metadata = { title: "Inicio" };

export default async function DashboardPage() {
  const { session } = await requireActiveAccess();
  const userId = session.user.id;

  // Continue-watching: rows the user has started but not completed.
  const inProgress = await prisma.classView.findMany({
    where: {
      userId,
      lastPositionSeconds: { gt: 5 },
      completedAt: null,
      class: { status: "published" },
    },
    include: { class: { include: { category: true } } },
    orderBy: { lastViewedAt: "desc" },
    take: 12,
  });

  const continueWatching: ClassCardData[] = inProgress.map((v) => {
    const total = v.class.durationSeconds || 1;
    const pct = Math.min(99, Math.round((v.lastPositionSeconds / total) * 100));
    return {
      id: v.class.id,
      slug: v.class.slug,
      title: v.class.title,
      durationSeconds: v.class.durationSeconds,
      level: v.class.level,
      thumbnailUrl: v.class.thumbnailUrl,
      category: v.class.category,
      progressPct: pct,
    };
  });

  const recent = await prisma.class.findMany({
    where: { status: "published" },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: 12,
  });

  const recentCards: ClassCardData[] = recent.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    durationSeconds: c.durationSeconds,
    level: c.level,
    thumbnailUrl: c.thumbnailUrl,
    category: c.category,
  }));

  // By-category rows.
  const categories = await prisma.category.findMany({
    where: { classes: { some: { status: "published" } } },
    orderBy: { sortOrder: "asc" },
  });

  const byCategory = await Promise.all(
    categories.map(async (cat) => {
      const items = await prisma.class.findMany({
        where: { status: "published", categoryId: cat.id },
        include: { category: true },
        orderBy: { publishedAt: "desc" },
        take: 12,
      });
      return {
        cat,
        items: items.map((c) => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          durationSeconds: c.durationSeconds,
          level: c.level,
          thumbnailUrl: c.thumbnailUrl,
          category: c.category,
        })) satisfies ClassCardData[],
      };
    }),
  );

  const firstName = session?.user.name?.split(" ")[0] ?? "atleta";

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10 space-y-12">
      {/* Greeting hero — plum gradient with sunset accents */}
      <header className="relative isolate rounded-3xl overflow-hidden bg-plum-hero texture-grain p-8 sm:p-12">
        <div className="absolute -top-16 -right-16 size-56 rounded-full bg-brand-coral/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 size-56 rounded-full bg-brand-amber/20 blur-3xl" />
        <div className="relative">
          <Badge className="bg-white/15 text-white border-white/20 backdrop-blur-sm">
            <Flame className="size-3.5 text-brand-amber" />
            {continueWatching.length > 0 ? "Seguí donde dejaste" : "Bienvenida"}
          </Badge>
          <h1 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Hola, <span className="text-gradient-sunset">{firstName}</span> 👋
          </h1>
          <p className="mt-3 text-white/80 max-w-md">
            Tu biblioteca, lista cuando vos quieras. ¿Qué entrenamos hoy?
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/app/clases"
              className={cn(
                buttonVariants({ size: "default" }),
                "bg-sunset border-0 text-white shadow-md shadow-brand-coral/30 hover:opacity-95 hover:shadow-brand-coral/40 transition-all font-semibold",
              )}
            >
              <Library className="size-4" />
              Explorar clases
            </Link>
            <Link
              href="/app/listas"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "bg-white/10 border-white/30 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white",
              )}
            >
              <Sparkles className="size-4" />
              Mis listas
            </Link>
          </div>
        </div>
      </header>

      {continueWatching.length > 0 && (
        <ClassRow title="Continuar viendo" classes={continueWatching} />
      )}

      <ClassRow
        title="Recién agregadas"
        href="/app/clases"
        classes={recentCards}
      />

      {byCategory.map(({ cat, items }) => (
        <ClassRow
          key={cat.id}
          title={cat.name}
          href={`/app/clases?cat=${cat.slug}`}
          classes={items}
        />
      ))}

      {recentCards.length === 0 && (
        <div className="relative rounded-3xl border-2 border-dashed border-brand-coral/30 bg-brand-coral/5 p-10 text-center">
          <div className="size-12 mx-auto rounded-2xl bg-sunset grid place-items-center shadow-lg shadow-brand-coral/30">
            <Library className="size-5 text-white" />
          </div>
          <p className="mt-4 font-semibold text-lg">
            Tu biblioteca está casi lista.
          </p>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            Pronto vas a ver acá las clases publicadas. Mientras tanto, podés
            empezar a explorar.
          </p>
          <Link
            href="/app/clases"
            className={cn(
              buttonVariants({ size: "sm" }),
              "mt-5 bg-sunset border-0 text-white shadow-md shadow-brand-coral/25 hover:opacity-95",
            )}
          >
            Explorar clases
          </Link>
        </div>
      )}
    </div>
  );
}
