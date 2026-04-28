"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetAction, type ActionState } from "@/lib/actions/auth";

const initial: ActionState = { ok: false, message: "" };

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const action = resetAction.bind(null, token);
  const [state, formAction, pending] = useActionState(action, initial);

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      const t = setTimeout(() => router.push(state.redirectTo!), 1500);
      return () => clearTimeout(t);
    }
  }, [state, router]);

  if (state.ok) {
    return (
      <div className="rounded-xl border bg-accent/40 p-6 text-center space-y-2">
        <p className="font-medium">¡Listo!</p>
        <p className="text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña nueva</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          disabled={pending}
        />
        {state.fieldErrors?.password && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.password}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Repetir contraseña</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          disabled={pending}
        />
        {state.fieldErrors?.confirmPassword && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.confirmPassword}
          </p>
        )}
      </div>
      {state.message && !state.ok && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Guardando…" : "Guardar contraseña"}
      </Button>
    </form>
  );
}
