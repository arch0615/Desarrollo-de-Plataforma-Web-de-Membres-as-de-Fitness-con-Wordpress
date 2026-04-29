"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markPaymentApprovedAction } from "@/lib/actions/admin-payments";

export function ApprovePaymentButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function approve() {
    if (
      !confirm(
        "¿Marcar este pago como aprobado? Esto activa la suscripción asociada.",
      )
    )
      return;
    start(async () => {
      try {
        const r = await markPaymentApprovedAction(paymentId);
        if (!r.ok) {
          toast.error(r.message);
          return;
        }
        toast.success(r.message);
        router.refresh();
      } catch {
        toast.error("No pudimos aprobar el pago.");
      }
    });
  }

  return (
    <Button size="sm" onClick={approve} disabled={pending}>
      {pending ? "Aprobando…" : "Aprobar"}
    </Button>
  );
}
