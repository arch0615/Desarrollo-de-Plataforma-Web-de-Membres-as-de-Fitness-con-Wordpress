"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createClassAction,
  type AdminActionState,
} from "@/lib/actions/classes";

const initial: AdminActionState = { ok: false, message: "" };

type Category = { id: string; name: string };

export function NewClassForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(createClassAction, initial);

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" required disabled={pending} />
        {!state.ok && state.fieldErrors?.title && (
          <p className="text-sm text-destructive">{state.fieldErrors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Categoría</Label>
        <select
          id="categoryId"
          name="categoryId"
          required
          disabled={pending}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="">Elegí una categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {!state.ok && state.fieldErrors?.categoryId && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.categoryId}
          </p>
        )}
      </div>

      {!state.ok && state.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Creando…" : "Crear clase"}
      </Button>
    </form>
  );
}
