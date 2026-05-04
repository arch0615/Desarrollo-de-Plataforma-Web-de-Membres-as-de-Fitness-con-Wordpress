import Link from "next/link";
import { Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ClassCard, type ClassCardData } from "@/components/classes/class-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requireActiveAccess } from "@/lib/access";

export const metadata = { title: "Favoritos" };

export default async function FavoritesPage() {
  const { session } = await requireActiveAccess();
  const userId = session.user.id;

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
      <header className="mb-8">
        <Badge
          variant="secondary"
          className="bg-brand-coral/10 text-brand-coral border-0"
        >
          <Heart className="size-3.5 fill-brand-coral" />
          Favoritos
        </Badge>
        <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
          Tus clases <span className="text-gradient-sunset">guardadas</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Volvé cuando quieras a las clases que más te gustaron.
        </p>
      </header>

      {cards.length === 0 ? (
        <div className="relative rounded-3xl border-2 border-dashed border-brand-coral/30 bg-brand-coral/5 p-10 text-center">
          <div className="size-12 mx-auto rounded-2xl bg-sunset grid place-items-center shadow-lg shadow-brand-coral/30">
            <Heart className="size-5 text-white fill-white" />
          </div>
          <p className="mt-4 font-semibold text-lg">
            Todavía no guardaste clases
          </p>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            Tocá el corazón en una clase para sumarla acá.
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
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-5">
            <span className="font-bold text-foreground">{cards.length}</span>{" "}
            {cards.length === 1 ? "clase guardada" : "clases guardadas"}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {cards.map((c) => (
              <ClassCard key={c.id} c={c} size="sm" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
