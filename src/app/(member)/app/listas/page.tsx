import Link from "next/link";
import { ListMusic, Play } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
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
      <header className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <Badge
            variant="secondary"
            className="bg-brand-coral/10 text-brand-coral border-0"
          >
            <ListMusic className="size-3.5" />
            Mis listas
          </Badge>
          <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
            Tus rutinas, <span className="text-gradient-sunset">a tu modo</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Organizá clases en listas para volver cuando quieras.
          </p>
        </div>
        <CreatePlaylistButton />
      </header>

      {playlists.length === 0 ? (
        <div className="relative rounded-3xl border-2 border-dashed border-brand-coral/30 bg-brand-coral/5 p-10 text-center">
          <div className="size-12 mx-auto rounded-2xl bg-sunset grid place-items-center shadow-lg shadow-brand-coral/30">
            <ListMusic className="size-5 text-white" />
          </div>
          <p className="mt-4 font-semibold text-lg">Todavía no tenés listas</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
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
                className="group rounded-2xl border overflow-hidden bg-card transition-all hover:shadow-xl hover:shadow-brand-plum/10 hover:-translate-y-0.5"
              >
                <div className="relative aspect-video overflow-hidden bg-sunset grid place-items-center">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-white/90 text-xs font-bold uppercase tracking-widest">
                      {fallback}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-3 right-3 size-10 rounded-full bg-white/95 backdrop-blur-sm grid place-items-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="size-4 fill-brand-coral text-brand-coral ml-0.5" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-semibold line-clamp-1 group-hover:text-brand-coral transition-colors">
                    {p.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
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
