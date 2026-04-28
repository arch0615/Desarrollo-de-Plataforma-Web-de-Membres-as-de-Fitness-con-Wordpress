import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CreatePlaylistButton } from "./create-playlist-button";
import { requireActiveAccess } from "@/lib/access";

export const metadata = { title: "Mis listas" };

export default async function PlaylistsPage() {
  const { session } = await requireActiveAccess();
  const userId = session.user.id;

  const playlists = await prisma.playlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        take: 1,
        orderBy: { sortOrder: "asc" },
        include: { class: { select: { thumbnailUrl: true, category: { select: { name: true } } } } },
      },
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10">
      <header className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Mis listas
          </h1>
          <p className="mt-1 text-muted-foreground">
            Organizá tus rutinas como quieras.
          </p>
        </div>
        <CreatePlaylistButton />
      </header>

      {playlists.length === 0 ? (
        <div className="rounded-2xl border p-8 text-center bg-accent/30">
          <p className="font-medium">Todavía no tenés listas</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Creá una lista y armá tu rutina favorita.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((p) => {
            const cover = p.items[0]?.class?.thumbnailUrl ?? null;
            const fallback = p.items[0]?.class?.category?.name ?? "Lista vacía";
            return (
              <Link
                key={p.id}
                href={`/app/listas/${p.id}`}
                className="rounded-2xl border overflow-hidden hover:bg-accent/40 transition-colors"
              >
                <div className="aspect-video bg-gradient-to-br from-muted to-muted-foreground/15 grid place-items-center">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-muted-foreground/40 text-xs uppercase tracking-wide">
                      {fallback}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-medium line-clamp-1">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p._count.items} {p._count.items === 1 ? "clase" : "clases"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
