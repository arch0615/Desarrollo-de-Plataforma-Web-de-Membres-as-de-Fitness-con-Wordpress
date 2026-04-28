import Link from "next/link";
import { XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "No pudimos cobrar" };

export default function CheckoutErrorPage() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 text-center">
      <XCircle className="size-12 text-destructive" />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        No pudimos completar el pago
      </h1>
      <p className="mt-2 text-muted-foreground max-w-md">
        Pudo haber sido un problema con la tarjeta o con la red. Probá de
        nuevo, o escribinos si seguís sin poder.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/membresia" className={buttonVariants()}>
          Reintentar
        </Link>
        <a
          href="mailto:hola@milagros.app"
          className={buttonVariants({ variant: "outline" })}
        >
          Contactar
        </a>
      </div>
    </div>
  );
}
