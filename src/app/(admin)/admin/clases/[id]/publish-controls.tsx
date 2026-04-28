"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  publishClassAction,
  unpublishClassAction,
  archiveClassAction,
  deleteClassAction,
} from "@/lib/actions/classes";

type Props = {
  classId: string;
  status: "draft" | "processing" | "published" | "archived";
  hasVideo: boolean;
  bunnyConfigured: boolean;
};

export function PublishControls({
  classId,
  status,
  hasVideo,
  bunnyConfigured,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(label: string, fn: () => Promise<void>, after?: () => void) {
    start(async () => {
      try {
        await fn();
        toast.success(label);
        after?.();
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Algo falló.");
      }
    });
  }

  return (
    <div className="rounded-2xl border p-5 space-y-3">
      <p className="font-medium">Estado</p>
      <p className="text-sm text-muted-foreground">
        {status === "published"
          ? "Esta clase está publicada y visible para los miembros."
          : status === "archived"
            ? "Está archivada — no aparece en la biblioteca."
            : "Borrador — no es visible aún."}
      </p>

      {status !== "published" && (
        <Button
          disabled={pending || (bunnyConfigured && !hasVideo)}
          onClick={() =>
            run("Clase publicada", () => publishClassAction(classId))
          }
        >
          {pending ? "Trabajando…" : "Publicar"}
        </Button>
      )}
      {status === "published" && (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() =>
            run("Despublicada", () => unpublishClassAction(classId))
          }
        >
          Despublicar
        </Button>
      )}

      {status !== "archived" && (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => run("Archivada", () => archiveClassAction(classId))}
        >
          Archivar
        </Button>
      )}

      <Button
        variant="destructive"
        disabled={pending}
        onClick={() => {
          if (
            confirm(
              "¿Eliminar la clase definitivamente? Esto también borra el video en Bunny.",
            )
          ) {
            run("Eliminada", () => deleteClassAction(classId));
          }
        }}
      >
        Eliminar
      </Button>

      {bunnyConfigured && !hasVideo && status !== "published" && (
        <p className="text-xs text-muted-foreground">
          Subí el video antes de publicar.
        </p>
      )}
    </div>
  );
}
