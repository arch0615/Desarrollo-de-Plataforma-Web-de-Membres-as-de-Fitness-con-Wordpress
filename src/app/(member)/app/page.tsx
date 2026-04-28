import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClassRow } from "@/components/classes/class-row";
import type { ClassCardData } from "@/components/classes/class-card";

export const metadata = { title: "Inicio" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

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

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10 space-y-10">
      <header>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Hola, {session?.user.name?.split(" ")[0] ?? "atleta"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Tu biblioteca, lista cuando vos quieras.
        </p>
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
        <div className="rounded-2xl border p-8 text-center bg-accent/30">
          <p className="font-medium">Tu biblioteca está casi lista.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pronto vas a ver acá las clases publicadas.
          </p>
          <Link
            href="/app/clases"
            className="text-sm underline mt-3 inline-block"
          >
            Explorar clases
          </Link>
        </div>
      )}
    </div>
  );
}
