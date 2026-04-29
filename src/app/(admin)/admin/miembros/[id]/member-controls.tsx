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
import {
  extendSubscriptionAction,
  suspendMemberAction,
  sendPasswordResetAction,
} from "@/lib/actions/admin-members";

type Props = {
  userId: string;
  hasSubscription: boolean;
};

export function MemberControls({ userId, hasSubscription }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [extendOpen, setExtendOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [days, setDays] = useState(30);

  function run<T extends { ok: boolean; message: string }>(
    fn: () => Promise<T>,
    onSuccess?: () => void,
  ) {
    start(async () => {
      try {
        const r = await fn();
        if (!r.ok) {
          toast.error(r.message);
          return;
        }
        toast.success(r.message);
        onSuccess?.();
        router.refresh();
      } catch {
        toast.error("Algo falló.");
      }
    });
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button
        variant="outline"
        disabled={pending || !hasSubscription}
        onClick={() => setExtendOpen(true)}
      >
        Extender período
      </Button>
      <Button
        variant="outline"
        disabled={pending}
        onClick={() => run(() => sendPasswordResetAction(userId))}
      >
        Enviar reset de contraseña
      </Button>
      <Button
        variant="destructive"
        disabled={pending || !hasSubscription}
        onClick={() => setSuspendOpen(true)}
      >
        Suspender acceso
      </Button>

      <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extender período</DialogTitle>
            <DialogDescription>
              Agrega días al final del período actual. Reactiva la suscripción
              si estaba cancelada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ext-days">Días a sumar</Label>
            <Input
              id="ext-days"
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              disabled={pending}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExtendOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              disabled={pending}
              onClick={() =>
                run(
                  () => extendSubscriptionAction(userId, days),
                  () => setExtendOpen(false),
                )
              }
            >
              {pending ? "Trabajando…" : "Extender"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspender acceso</DialogTitle>
            <DialogDescription>
              Marca la suscripción como vencida. La miembro pierde acceso
              inmediatamente. Esto NO reembolsa el pago — usalo para casos
              especiales (chargeback, abuso).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSuspendOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                run(
                  () => suspendMemberAction(userId),
                  () => setSuspendOpen(false),
                )
              }
            >
              {pending ? "Trabajando…" : "Suspender"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
