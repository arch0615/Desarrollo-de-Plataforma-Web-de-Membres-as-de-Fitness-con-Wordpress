import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { formatDuration } from "@/lib/format";
import { PlaylistActions } from "./playlist-actions";
import { PlaylistItemRow } from "./playlist-item-row";

export const metadata = { title: "Lista" };

const levelLabel = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
} as const;

export default async function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const playlist = await prisma.playlist.findFirst({
    where: { id, userId },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: { class: { include: { category: true } } },
      },
    },
  });
  if (!playlist) notFound();

  const totalSeconds = playlist.items.reduce(
    (acc, it) => acc + it.class.durationSeconds,
    0,
  );

  const firstSlug = playlist.items[0]?.class.slug;

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10">
      <Link
        href="/app/listas"
        className="text-sm text-muted-foreground underline"
      >
        ← Mis listas
      </Link>

      <div className="mt-2 flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="mt-1 text-muted-foreground">{playlist.description}</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {playlist.items.length}{" "}
            {playlist.items.length === 1 ? "clase" : "clases"} ·{" "}
            {formatDuration(totalSeconds)}
          </p>
        </div>
        <div className="flex gap-2">
          {firstSlug && (
            <Link
              href={`/app/clase/${firstSlug}`}
              className={buttonVariants()}
            >
              ▶ Reproducir todo
            </Link>
          )}
          <PlaylistActions
            playlistId={playlist.id}
            initialName={playlist.name}
            initialDescription={playlist.description ?? ""}
          />
        </div>
      </div>

      <div className="mt-6">
        {playlist.items.length === 0 ? (
          <div className="rounded-2xl border p-8 text-center bg-accent/30">
            <p className="font-medium">La lista está vacía</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Agregá clases desde la página de cada clase.
            </p>
            <Link
              href="/app/clases"
              className={buttonVariants({
                variant: "outline",
                className: "mt-4",
              })}
            >
              Explorar clases
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border divide-y">
            {playlist.items.map((it, i) => (
              <PlaylistItemRow
                key={it.classId}
                playlistId={playlist.id}
                classId={it.classId}
                index={i}
                isFirst={i === 0}
                isLast={i === playlist.items.length - 1}
                slug={it.class.slug}
                title={it.class.title}
                durationSeconds={it.class.durationSeconds}
                categoryName={it.class.category.name}
                level={levelLabel[it.class.level]}
                thumbnailUrl={it.class.thumbnailUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
