"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  createPlanAction,
  updatePlanAction,
  togglePlanActiveAction,
} from "@/lib/actions/admin-catalog";
import { formatPrice, intervalLabel } from "@/lib/format";

type Plan = {
  id: string;
  name: string;
  slug: string;
  interval: "month" | "quarter" | "year";
  priceCents: number;
  currency: string;
  isActive: boolean;
  sortOrder: number;
  features: string[];
  subCount: number;
};

export function PlansEditor({ items }: { items: Plan[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [creating, setCreating] = useState(false);

  function refresh() {
    router.refresh();
  }

  function create(fd: FormData) {
    start(async () => {
      const r = await createPlanAction(fd);
      if (!r.ok) {
        toast.error(r.message);
        return;
      }
      toast.success(r.message);
      setCreating(false);
      refresh();
    });
  }

  function save(p: Plan, fd: FormData) {
    start(async () => {
      const r = await updatePlanAction(p.id, fd);
      if (!r.ok) {
        toast.error(r.message);
        return;
      }
      toast.success(r.message);
      refresh();
    });
  }

  function toggle(p: Plan) {
    start(async () => {
      const r = await togglePlanActiveAction(p.id);
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
      <div className="flex justify-end">
        {!creating ? (
          <Button onClick={() => setCreating(true)}>Nuevo plan</Button>
        ) : (
          <Button variant="outline" onClick={() => setCreating(false)}>
            Cancelar
          </Button>
        )}
      </div>

      {creating && (
        <PlanFormCard onSubmit={create} pending={pending} mode="create" />
      )}

      {items.length === 0 && !creating && (
        <p className="rounded-2xl border p-5 text-sm text-muted-foreground">
          Aún no hay planes. Creá uno para empezar.
        </p>
      )}

      {items.map((p) => (
        <div key={p.id} className="rounded-2xl border p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="font-semibold">
                {p.name}{" "}
                <span className="text-sm text-muted-foreground font-normal">
                  /{p.slug}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                {formatPrice(p.priceCents, { currency: p.currency })} por{" "}
                {intervalLabel(p.interval)} · {p.subCount} suscripciones
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={p.isActive ? "default" : "outline"}>
                {p.isActive ? "Activo" : "Inactivo"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => toggle(p)}
              >
                {p.isActive ? "Desactivar" : "Activar"}
              </Button>
            </div>
          </div>
          <PlanFormCard
            onSubmit={(fd) => save(p, fd)}
            pending={pending}
            mode="edit"
            initial={p}
          />
        </div>
      ))}
    </div>
  );
}

function PlanFormCard({
  onSubmit,
  pending,
  mode,
  initial,
}: {
  onSubmit: (fd: FormData) => void;
  pending: boolean;
  mode: "create" | "edit";
  initial?: Plan;
}) {
  return (
    <form
      action={onSubmit}
      className={
        mode === "create"
          ? "rounded-2xl border p-5 space-y-3"
          : "mt-4 pt-4 border-t space-y-3"
      }
    >
      {mode === "create" && <p className="font-medium">Nuevo plan</p>}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Nombre</Label>
          <Input
            name="name"
            defaultValue={initial?.name ?? ""}
            required
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label>Intervalo</Label>
          <select
            name="interval"
            defaultValue={initial?.interval ?? "month"}
            disabled={pending}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="month">Mensual</option>
            <option value="quarter">Trimestral</option>
            <option value="year">Anual</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Precio (centavos)</Label>
          <Input
            name="priceCents"
            type="number"
            min={100}
            defaultValue={initial?.priceCents ?? 1500000}
            required
            disabled={pending}
          />
          <p className="text-xs text-muted-foreground">
            ARS 15.000 → 1500000
          </p>
        </div>
        <div className="space-y-2">
          <Label>Moneda</Label>
          <Input
            name="currency"
            defaultValue={initial?.currency ?? "ARS"}
            required
            maxLength={4}
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label>Orden de visualización</Label>
          <Input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={initial?.sortOrder ?? 0}
            disabled={pending}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Beneficios (uno por línea)</Label>
          <textarea
            name="features"
            rows={4}
            defaultValue={(initial?.features ?? []).join("\n")}
            disabled={pending}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : mode === "create" ? "Crear plan" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
