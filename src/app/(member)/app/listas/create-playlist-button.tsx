"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { createPlaylistAction } from "@/lib/actions/playlists";

export function CreatePlaylistButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit() {
    start(async () => {
      const r = await createPlaylistAction(name.trim(), desc.trim() || undefined);
      if (!r.ok) {
        toast.error(r.message);
        return;
      }
      toast.success("Lista creada");
      setOpen(false);
      setName("");
      setDesc("");
      router.push(`/app/listas/${r.id}`);
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nueva lista</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva lista</DialogTitle>
            <DialogDescription>
              Dale un nombre y empezá a sumar clases.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pl-name">Nombre</Label>
              <Input
                id="pl-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mañanas activas"
                disabled={pending}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pl-desc">Descripción (opcional)</Label>
              <Input
                id="pl-desc"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="¿Para qué la armaste?"
                disabled={pending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button onClick={submit} disabled={pending || !name.trim()}>
              {pending ? "Creando…" : "Crear lista"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
