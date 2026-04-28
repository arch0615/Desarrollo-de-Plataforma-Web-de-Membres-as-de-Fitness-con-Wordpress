"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/format";
import {
  moveClassInPlaylistAction,
  removeClassFromPlaylistAction,
} from "@/lib/actions/playlists";

type Props = {
  playlistId: string;
  classId: string;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  slug: string;
  title: string;
  durationSeconds: number;
  categoryName: string;
  level: string;
  thumbnailUrl: string | null;
};

export function PlaylistItemRow(props: Props) {
  const [pending, start] = useTransition();

  function move(direction: "up" | "down") {
    start(async () => {
      const r = await moveClassInPlaylistAction(
        props.playlistId,
        props.classId,
        direction,
      );
      if (!r.ok) toast.error(r.message);
    });
  }

  function remove() {
    if (!confirm("¿Quitar esta clase de la lista?")) return;
    start(async () => {
      const r = await removeClassFromPlaylistAction(
        props.playlistId,
        props.classId,
      );
      if (!r.ok) toast.error(r.message);
      else toast.success("Quitada de la lista");
    });
  }

  return (
    <div className="flex items-center gap-3 p-3 sm:p-4">
      <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
        {props.index + 1}
      </span>
      <Link
        href={`/app/clase/${props.slug}`}
        className="size-16 sm:size-20 rounded-md overflow-hidden bg-gradient-to-br from-muted to-muted-foreground/15 grid place-items-center shrink-0"
      >
        {props.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[10px] text-muted-foreground/40 px-1">
            {props.categoryName}
          </span>
        )}
      </Link>
      <Link
        href={`/app/clase/${props.slug}`}
        className="flex-1 min-w-0 hover:underline"
      >
        <p className="font-medium line-clamp-1">{props.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {props.categoryName} · {formatDuration(props.durationSeconds)}
        </p>
      </Link>
      <Badge variant="outline" className="hidden sm:inline-flex shrink-0">
        {props.level}
      </Badge>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="icon-sm"
          variant="ghost"
          disabled={pending || props.isFirst}
          onClick={() => move("up")}
          aria-label="Mover arriba"
        >
          <ArrowUp className="size-4" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          disabled={pending || props.isLast}
          onClick={() => move("down")}
          aria-label="Mover abajo"
        >
          <ArrowDown className="size-4" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          disabled={pending}
          onClick={remove}
          aria-label="Quitar de la lista"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
