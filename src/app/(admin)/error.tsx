"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("(admin) error:", error);
  }, [error]);

  return (
    <div className="p-10 max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">
        Error en el panel
      </h1>
      <p className="mt-2 text-muted-foreground">
        Algo falló al cargar esta sección.
      </p>
      <pre className="mt-3 text-xs bg-muted/40 p-2 rounded overflow-x-auto">
        {error.message}
      </pre>
      {error.digest && (
        <p className="mt-2 text-xs text-muted-foreground/60 font-mono">
          ref: {error.digest}
        </p>
      )}
      <div className="mt-6 flex gap-2">
        <Button onClick={reset}>Reintentar</Button>
        <Link href="/admin" className={buttonVariants({ variant: "outline" })}>
          Dashboard
        </Link>
      </div>
    </div>
  );
}
