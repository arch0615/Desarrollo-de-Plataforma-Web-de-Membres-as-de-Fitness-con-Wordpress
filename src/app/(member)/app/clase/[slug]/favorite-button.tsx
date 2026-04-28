"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleFavoriteAction } from "@/lib/actions/library";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  classId,
  initiallyFavorited,
}: {
  classId: string;
  initiallyFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initiallyFavorited);
  const [pending, start] = useTransition();

  function toggle() {
    const optimistic = !favorited;
    setFavorited(optimistic);
    start(async () => {
      try {
        const r = await toggleFavoriteAction(classId);
        setFavorited(r.favorited);
        toast.success(
          r.favorited ? "Agregado a favoritos" : "Quitado de favoritos",
        );
      } catch {
        setFavorited(!optimistic);
        toast.error("No pudimos guardar el cambio.");
      }
    });
  }

  return (
    <Button
      variant={favorited ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      disabled={pending}
      aria-pressed={favorited}
      aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <Heart
        className={cn("size-4", favorited && "fill-current")}
      />
      <span className="hidden sm:inline">
        {favorited ? "En favoritos" : "Favorito"}
      </span>
    </Button>
  );
}
