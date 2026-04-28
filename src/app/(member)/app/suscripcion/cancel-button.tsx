"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cancelSubscriptionAction } from "@/lib/actions/checkout";

export function CancelSubscriptionButton({
  periodEnd,
}: {
  periodEnd: Date | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  function confirm() {
    start(async () => {
      try {
        const r = await cancelSubscriptionAction();
        if (!r.ok) {
          toast.error(r.message);
          return;
        }
        toast.success(r.message);
        setOpen(false);
        router.refresh();
      } catch {
        toast.error("No pudimos procesar la cancelación.");
      }
    });
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Cancelar suscripción
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar suscripción</DialogTitle>
            <DialogDescription>
              {periodEnd
                ? `Mantenés acceso completo hasta el ${periodEnd.toLocaleDateString("es-AR")}. Después la suscripción no se renueva.`
                : "Tu cancelación queda registrada y procesamos el cierre del período."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={confirm}
              disabled={pending}
            >
              {pending ? "Procesando…" : "Sí, cancelar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
