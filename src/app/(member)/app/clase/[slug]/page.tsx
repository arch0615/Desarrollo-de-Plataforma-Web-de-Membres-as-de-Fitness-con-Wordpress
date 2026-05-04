import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Layers } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireActiveAccess } from "@/lib/access";
import { Badge } from "@/components/ui/badge";
import { ClassCard, type ClassCardData } from "@/components/classes/class-card";
import { formatDuration } from "@/lib/format";
import { buildPlaybackInfo, isBunnyConfigured } from "@/lib/bunny";
import { ClassPlayer } from "./class-player";
import { FavoriteButton } from "./favorite-button";
import { AddToPlaylistButton } from "./add-to-playlist-button";

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
  const { session } = await requireActiveAccess();
  const userId = session.user.id;

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
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-brand-coral transition-colors group"
      >
        <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
        Volver a la biblioteca
      </Link>

      <div className="mt-4 rounded-3xl overflow-hidden border bg-card shadow-xl shadow-brand-plum/10">
        <ClassPlayer
          classId={cls.id}
          embedUrl={playback?.embedUrl ?? null}
          bunnyConfigured={bunnyOk}
          hasVideo={!!cls.bunnyVideoId}
          resumeAt={resumeAt}
          durationSeconds={cls.durationSeconds}
        />
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_340px] gap-8">
        <div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-brand-coral/10 text-brand-coral border-0">
                  {cls.category.name}
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Clock className="size-3.5" />
                  {formatDuration(cls.durationSeconds)}
                </span>
              </div>
              <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
                {cls.title}
              </h1>
              <div className="mt-3 flex gap-1.5 flex-wrap">
                <Badge
                  variant="outline"
                  className="border-brand-coral/30 text-brand-coral bg-brand-coral/5"
                >
                  {levelLabel[cls.level]}
                </Badge>
                {cls.equipment.map((e) => (
                  <Badge
                    key={e}
                    variant="secondary"
                    className="bg-brand-amber/15 text-brand-amber border-0"
                  >
                    <Layers className="size-3" />
                    {e}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <FavoriteButton
                classId={cls.id}
                initiallyFavorited={!!favorite}
              />
              <AddToPlaylistButton classId={cls.id} />
            </div>
          </div>

          {cls.description && (
            <div className="mt-6 rounded-2xl border bg-card p-6">
              <p className="text-foreground/80 whitespace-pre-line leading-relaxed">
                {cls.description}
              </p>
            </div>
          )}
        </div>

        {relatedCards.length > 0 && (
          <aside>
            <div className="sticky top-20">
              <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
                <span className="size-2 rounded-full bg-brand-coral" />
                Más de {cls.category.name}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {relatedCards.slice(0, 4).map((c) => (
                  <ClassCard key={c.id} c={c} size="sm" />
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
