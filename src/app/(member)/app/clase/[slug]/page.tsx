import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ClassCard, type ClassCardData } from "@/components/classes/class-card";
import { formatDuration } from "@/lib/format";
import { buildPlaybackInfo, isBunnyConfigured } from "@/lib/bunny";
import { ClassPlayer } from "./class-player";
import { FavoriteButton } from "./favorite-button";

export const dynamic = "force-dynamic";

const levelLabel = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cls = await prisma.class.findUnique({
    where: { slug },
    select: { title: true, description: true },
  });
  if (!cls) return { title: "Clase no encontrada" };
  return {
    title: cls.title,
    description: cls.description?.slice(0, 160),
  };
}

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const cls = await prisma.class.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!cls || cls.status !== "published") notFound();

  const [favorite, view, related] = await Promise.all([
    prisma.favorite.findUnique({
      where: { userId_classId: { userId, classId: cls.id } },
      select: { userId: true },
    }),
    prisma.classView.findUnique({
      where: { userId_classId: { userId, classId: cls.id } },
    }),
    prisma.class.findMany({
      where: {
        status: "published",
        categoryId: cls.categoryId,
        NOT: { id: cls.id },
      },
      include: { category: true },
      orderBy: { publishedAt: "desc" },
      take: 8,
    }),
  ]);

  // Build playback URL only if Bunny is configured AND we have a video id.
  const bunnyOk = isBunnyConfigured();
  const playback =
    bunnyOk && cls.bunnyVideoId
      ? buildPlaybackInfo(cls.bunnyVideoId)
      : null;

  const resumeAt =
    view?.lastPositionSeconds && view.lastPositionSeconds > 5 && !view.completedAt
      ? view.lastPositionSeconds
      : 0;

  const relatedCards: ClassCardData[] = related.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    durationSeconds: c.durationSeconds,
    level: c.level,
    thumbnailUrl: c.thumbnailUrl,
    category: c.category,
  }));

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <Link
        href="/app/clases"
        className="text-sm text-muted-foreground underline"
      >
        ← Volver a la biblioteca
      </Link>

      <ClassPlayer
        classId={cls.id}
        embedUrl={playback?.embedUrl ?? null}
        bunnyConfigured={bunnyOk}
        hasVideo={!!cls.bunnyVideoId}
        resumeAt={resumeAt}
        durationSeconds={cls.durationSeconds}
      />

      <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {cls.category.name} · {formatDuration(cls.durationSeconds)}
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight">
                {cls.title}
              </h1>
              <div className="mt-2 flex gap-1.5 flex-wrap">
                <Badge variant="outline">{levelLabel[cls.level]}</Badge>
                {cls.equipment.map((e) => (
                  <Badge key={e} variant="secondary">
                    {e}
                  </Badge>
                ))}
              </div>
            </div>
            <FavoriteButton
              classId={cls.id}
              initiallyFavorited={!!favorite}
            />
          </div>

          {cls.description && (
            <p className="mt-5 text-muted-foreground whitespace-pre-line leading-relaxed">
              {cls.description}
            </p>
          )}
        </div>

        {relatedCards.length > 0 && (
          <aside>
            <h2 className="text-lg font-semibold tracking-tight mb-3">
              Más de {cls.category.name}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              {relatedCards.slice(0, 4).map((c) => (
                <ClassCard key={c.id} c={c} size="sm" />
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
