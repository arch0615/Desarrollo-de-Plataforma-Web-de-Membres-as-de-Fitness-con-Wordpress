"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/lib/actions/admin-catalog";

type Cat = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  classCount: number;
};

export function CategoriesEditor({ items }: { items: Cat[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [newName, setNewName] = useState("");

  function refresh() {
    router.refresh();
  }

  function create() {
    start(async () => {
      const fd = new FormData();
      fd.set("name", newName);
      fd.set("sortOrder", String(items.length));
      const r = await createCategoryAction(fd);
      if (!r.ok) {
        toast.error(r.message);
        return;
      }
      toast.success(r.message);
      setNewName("");
      refresh();
    });
  }

  function remove(c: Cat) {
    if (c.classCount > 0) {
      toast.error(`No se puede: ${c.classCount} clase(s) usan esta categoría.`);
      return;
    }
    if (!confirm(`¿Eliminar la categoría "${c.name}"?`)) return;
    start(async () => {
      const r = await deleteCategoryAction(c.id);
      if (!r.ok) {
        toast.error(r.message);
        return;
      }
      toast.success(r.message);
      refresh();
    });
  }

  function save(c: Cat, fd: FormData) {
    start(async () => {
      const r = await updateCategoryAction(c.id, fd);
      if (!r.ok) {
        toast.error(r.message);
        return;
      }
      toast.success(r.message);
      refresh();
    });
  }

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-2xl border p-5">
        <p className="font-medium">Nueva categoría</p>
        <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-end">
          <div className="space-y-2 flex-1">
            <Label htmlFor="cat-name">Nombre</Label>
            <Input
              id="cat-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Yoga, HIIT, Stretching…"
              disabled={pending}
            />
          </div>
          <Button onClick={create} disabled={pending || !newName.trim()}>
            {pending ? "Creando…" : "Crear"}
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border divide-y">
        {items.length === 0 && (
          <p className="p-5 text-sm text-muted-foreground">
            No hay categorías todavía.
          </p>
        )}
        {items.map((c) => (
          <form
            key={c.id}
            action={(fd: FormData) => save(c, fd)}
            className="p-4 flex flex-col sm:flex-row sm:items-end gap-2"
          >
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs">Nombre</Label>
                <Input name="name" defaultValue={c.name} required />
                <p className="text-xs text-muted-foreground mt-1">
                  /{c.slug}
                </p>
              </div>
              <div>
                <Label className="text-xs">Orden</Label>
                <Input
                  name="sortOrder"
                  type="number"
                  min={0}
                  defaultValue={c.sortOrder}
                />
              </div>
              <div className="self-center sm:col-span-1">
                <Badge variant="outline">
                  {c.classCount} {c.classCount === 1 ? "clase" : "clases"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="outline" size="sm" disabled={pending}>
                Guardar
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                disabled={pending}
                onClick={() => remove(c)}
                aria-label="Eliminar"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </form>
        ))}
      </section>
    </div>
  );
}
