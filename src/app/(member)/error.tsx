"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function MemberError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("(member) error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-md text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Algo no salió bien
      </h1>
      <p className="mt-2 text-muted-foreground">
        Probá de nuevo. Si sigue sin andar, escribinos y lo resolvemos.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-muted-foreground/60 font-mono">
          ref: {error.digest}
        </p>
      )}
      <div className="mt-6 flex justify-center gap-2">
        <Button onClick={reset}>Reintentar</Button>
        <Link href="/app" className={buttonVariants({ variant: "outline" })}>
          Inicio
        </Link>
      </div>
    </div>
  );
}
