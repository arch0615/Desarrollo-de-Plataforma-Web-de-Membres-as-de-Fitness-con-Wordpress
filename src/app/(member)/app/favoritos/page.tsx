import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClassCard, type ClassCardData } from "@/components/classes/class-card";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Favoritos" };

export default async function FavoritesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { class: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });

  const cards: ClassCardData[] = favorites
    .filter((f) => f.class.status === "published")
    .map((f) => ({
      id: f.class.id,
      slug: f.class.slug,
      title: f.class.title,
      durationSeconds: f.class.durationSeconds,
      level: f.class.level,
      thumbnailUrl: f.class.thumbnailUrl,
      category: f.class.category,
    }));

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Favoritos
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tus clases guardadas para volver cuando quieras.
        </p>
      </header>

      {cards.length === 0 ? (
        <div className="rounded-2xl border p-8 text-center bg-accent/30">
          <p className="font-medium">Todavía no guardaste clases</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tocá el corazón en una clase para sumarla acá.
          </p>
          <Link
            href="/app/clases"
            className={buttonVariants({ variant: "outline", className: "mt-4" })}
          >
            Explorar clases
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((c) => (
            <ClassCard key={c.id} c={c} size="sm" />
          ))}
        </div>
      )}
    </div>
  );
}
