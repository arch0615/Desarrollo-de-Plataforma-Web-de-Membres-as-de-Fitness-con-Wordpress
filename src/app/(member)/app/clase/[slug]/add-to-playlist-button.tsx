"use client";

import { useEffect, useState, useTransition } from "react";
import { ListPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  addClassToPlaylistAction,
  createPlaylistAction,
} from "@/lib/actions/playlists";

type Playlist = { id: string; name: string; itemCount: number };

export function AddToPlaylistButton({ classId }: { classId: string }) {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [pending, start] = useTransition();

  // Lazy-fetch playlists when the dialog opens.
  useEffect(() => {
    if (!open || playlists !== null) return;
    fetch("/api/playlists")
      .then((r) => r.json())
      .then((data) => setPlaylists(data.playlists ?? []))
      .catch(() => setPlaylists([]));
  }, [open, playlists]);

  function addToExisting(id: string) {
    start(async () => {
      const r = await addClassToPlaylistAction(id, classId);
      if (!r.ok) {
        toast.error(r.message);
        return;
      }
      toast.success("Agregada a la lista");
      setOpen(false);
    });
  }

  function createAndAdd() {
    start(async () => {
      const r = await createPlaylistAction(newName.trim());
      if (!r.ok) {
        toast.error(r.message);
        return;
      }
      const r2 = await addClassToPlaylistAction(r.id, classId);
      if (!r2.ok) {
        toast.error(r2.message);
        return;
      }
      toast.success("Lista creada y clase agregada");
      setOpen(false);
      setCreating(false);
      setNewName("");
      setPlaylists(null); // force refresh next open
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label="Agregar a una lista"
      >
        <ListPlus className="size-4" />
        <span className="hidden sm:inline">A una lista</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar a una lista</DialogTitle>
            <DialogDescription>
              Elegí una lista existente o creá una nueva.
            </DialogDescription>
          </DialogHeader>

          {!creating && (
            <>
              <div className="max-h-72 overflow-y-auto space-y-1.5">
                {playlists === null ? (
                  <p className="text-sm text-muted-foreground py-3">
                    Cargando listas…
                  </p>
                ) : playlists.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-3">
                    No tenés listas todavía.
                  </p>
                ) : (
                  playlists.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addToExisting(p.id)}
                      disabled={pending}
                      className="w-full text-left px-3 py-2 rounded-md border hover:bg-accent disabled:opacity-50"
                    >
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.itemCount} {p.itemCount === 1 ? "clase" : "clases"}
                      </p>
                    </button>
                  ))
                )}
              </div>
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCreating(true)}
                  disabled={pending}
                >
                  + Crear lista nueva
                </Button>
              </div>
            </>
          )}

          {creating && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="np-name">Nombre de la lista</Label>
                <Input
                  id="np-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Mañanas activas"
                  autoFocus
                  disabled={pending}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setCreating(false)}
                  disabled={pending}
                >
                  Atrás
                </Button>
                <Button
                  onClick={createAndAdd}
                  disabled={pending || !newName.trim()}
                >
                  {pending ? "Creando…" : "Crear y agregar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
