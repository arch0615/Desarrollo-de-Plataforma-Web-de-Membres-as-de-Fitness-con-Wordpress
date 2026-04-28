"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateClassAction,
  type AdminActionState,
} from "@/lib/actions/classes";

const initial: AdminActionState = { ok: false, message: "" };

type Props = {
  cls: {
    id: string;
    title: string;
    description: string;
    categoryId: string;
    level: "beginner" | "intermediate" | "advanced";
    durationSeconds: number;
    equipment: string[];
  };
  categories: { id: string; name: string }[];
};

export function ClassEditor({ cls, categories }: Props) {
  const action = updateClassAction.bind(null, cls.id);
  const [state, formAction, pending] = useActionState(action, initial);

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    else if (!state.ok && state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          defaultValue={cls.title}
          required
          disabled={pending}
        />
        {!state.ok && state.fieldErrors?.title && (
          <p className="text-sm text-destructive">{state.fieldErrors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={cls.description}
          rows={5}
          disabled={pending}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Categoría</Label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={cls.categoryId}
            disabled={pending}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">Nivel</Label>
          <select
            id="level"
            name="level"
            defaultValue={cls.level}
            disabled={pending}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="durationSeconds">Duración (segundos)</Label>
          <Input
            id="durationSeconds"
            name="durationSeconds"
            type="number"
            min={0}
            defaultValue={cls.durationSeconds}
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="equipment">Equipo (separado por comas)</Label>
          <Input
            id="equipment"
            name="equipment"
            defaultValue={cls.equipment.join(", ")}
            placeholder="mat, mancuernas, banda"
            disabled={pending}
          />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
