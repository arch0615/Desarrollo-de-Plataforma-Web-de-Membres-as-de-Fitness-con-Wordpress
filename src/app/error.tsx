"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: send to Sentry once wired up.
    console.error("global error:", error);
  }, [error]);

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 text-center">
      <p className="text-sm uppercase tracking-wider text-muted-foreground">
        Algo salió mal
      </p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
        Tuvimos un problema
      </h1>
      <p className="mt-3 text-muted-foreground max-w-md">
        Probá de nuevo. Si sigue pasando, escribinos y lo resolvemos.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-muted-foreground/60 font-mono">
          ref: {error.digest}
        </p>
      )}
      <div className="mt-6 flex gap-2">
        <Button onClick={reset}>Reintentar</Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
