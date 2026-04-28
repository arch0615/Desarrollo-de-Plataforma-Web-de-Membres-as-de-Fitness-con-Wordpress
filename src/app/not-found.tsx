import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 text-center">
      <p className="text-sm uppercase tracking-wider text-muted-foreground">
        Error 404
      </p>
      <h1 className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight">
        Esta página no existe
      </h1>
      <p className="mt-3 text-muted-foreground max-w-md">
        Tal vez el link está roto o se mudó. Probá volver al inicio.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6" })}>
        Volver al inicio
      </Link>
    </div>
  );
}
