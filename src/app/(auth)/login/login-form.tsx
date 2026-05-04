"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type ActionState } from "@/lib/actions/auth";

const initial: ActionState = { ok: false, message: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

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
        {!state.ok && state.fieldErrors?.email && (
          <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
        />
        {!state.ok && state.fieldErrors?.password && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.password}
          </p>
        )}
      </div>
      {!state.ok && state.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      <Button
        type="submit"
        className="w-full bg-sunset border-0 text-white shadow-md shadow-brand-coral/25 hover:opacity-95 hover:shadow-brand-coral/40 transition-all h-11 text-base font-semibold"
        disabled={pending}
      >
        {pending ? "Ingresando…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}
