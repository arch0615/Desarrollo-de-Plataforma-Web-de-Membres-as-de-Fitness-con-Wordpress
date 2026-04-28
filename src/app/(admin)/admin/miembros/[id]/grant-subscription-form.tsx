"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { grantManualSubscriptionAction } from "@/lib/actions/checkout";

type Plan = { slug: string; name: string };

export function GrantSubscriptionForm({
  userId,
  plans,
}: {
  userId: string;
  plans: Plan[];
}) {
  const router = useRouter();
  const [planSlug, setPlanSlug] = useState(plans[0]?.slug ?? "");
  const [pending, start] = useTransition();

  function submit() {
    start(async () => {
      try {
        const r = await grantManualSubscriptionAction(userId, planSlug);
        if (!r.ok) {
          toast.error(r.message);
          return;
        }
        toast.success(r.message);
        router.refresh();
      } catch {
        toast.error("No pudimos otorgar el acceso.");
      }
    });
  }

  if (plans.length === 0) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        No hay planes activos. Creá un plan primero.
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-end">
      <div className="space-y-2 flex-1">
        <Label htmlFor="grant-plan">Plan</Label>
        <select
          id="grant-plan"
          value={planSlug}
          onChange={(e) => setPlanSlug(e.target.value)}
          disabled={pending}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        >
          {plans.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <Button onClick={submit} disabled={pending}>
        {pending ? "Otorgando…" : "Otorgar acceso"}
      </Button>
    </div>
  );
}
