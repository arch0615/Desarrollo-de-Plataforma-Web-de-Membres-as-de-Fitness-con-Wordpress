"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotAction, type ActionState } from "@/lib/actions/auth";

const initial: ActionState = { ok: false, message: "" };

export function ForgotForm() {
  const [state, formAction, pending] = useActionState(forgotAction, initial);

  if (state.ok) {
    return (
      <div className="rounded-xl border bg-accent/40 p-6 text-center space-y-2">
        <p className="font-medium">Revisá tu email</p>
        <p className="text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
        />
        {state.fieldErrors?.email && (
          <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
        )}
      </div>
      {state.message && !state.ok && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Enviando…" : "Enviar link"}
      </Button>
    </form>
  );
}
