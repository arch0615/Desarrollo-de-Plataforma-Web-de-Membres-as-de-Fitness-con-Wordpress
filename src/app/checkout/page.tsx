import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatPrice, intervalLabel } from "@/lib/format";
import { startCheckoutAction } from "@/lib/actions/checkout";
import { isMpConfigured } from "@/lib/mercadopago";

export const metadata = { title: "Confirmar suscripción" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login?from=/checkout");

  const sp = await searchParams;
  const planSlug = sp.plan;
  if (!planSlug) redirect("/membresia");

  const plan = await prisma.plan.findUnique({
    where: { slug: planSlug },
  });
  if (!plan || !plan.isActive) redirect("/membresia");

  const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];
  const mpReady = isMpConfigured();

  async function start() {
    "use server";
    await startCheckoutAction(planSlug!);
  }

  return (
    <div className="min-h-svh flex flex-col">
      <header className="container mx-auto px-4 py-4">
        <Link href="/" className="font-semibold">
          Milagros Fitness
        </Link>
      </header>
      <main className="flex-1 container mx-auto max-w-xl px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Confirmar suscripción
        </h1>
        <p className="mt-1 text-muted-foreground">
          Revisá los detalles antes de continuar.
        </p>

        <div className="mt-6 rounded-2xl border p-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Plan
          </p>
          <p className="mt-1 text-xl font-semibold">{plan.name}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-semibold">
              {formatPrice(plan.priceCents, { currency: plan.currency })}
            </span>
            <span className="text-muted-foreground text-sm">
              /{intervalLabel(plan.interval)}
            </span>
          </div>

          <ul className="mt-5 space-y-2">
            {features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="size-4 mt-0.5 shrink-0 text-foreground" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          La suscripción se renueva automáticamente al final de cada período.
          Podés cancelar cuando quieras desde tu panel de cuenta.
        </p>

        <form action={start} className="mt-6">
          <Button type="submit" size="lg" className="w-full">
            {mpReady ? "Continuar con Mercado Pago" : "Continuar"}
          </Button>
        </form>

        {!mpReady && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm">
            <p className="font-medium">Pago manual</p>
            <p className="mt-1 text-muted-foreground">
              Mercado Pago se está configurando. Tu pedido queda registrado
              como pendiente y se activa apenas confirmemos el pago.
            </p>
          </div>
        )}

        <div className="mt-6 text-sm text-center">
          <Link
            href="/membresia"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            ← Cambiar de plan
          </Link>
        </div>
      </main>
    </div>
  );
}
