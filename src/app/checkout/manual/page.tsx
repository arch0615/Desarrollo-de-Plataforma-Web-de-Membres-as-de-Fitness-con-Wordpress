import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice, intervalLabel } from "@/lib/format";

export const metadata = { title: "Pago pendiente" };

// Used when MP is not configured yet. The pending Subscription row exists;
// admin will activate it manually from /admin/miembros.

export default async function CheckoutManualPage({
  searchParams,
}: {
  searchParams: Promise<{ sub?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const subId = sp.sub;
  if (!subId) redirect("/membresia");

  const sub = await prisma.subscription.findFirst({
    where: { id: subId, userId: session.user.id },
    include: { plan: true },
  });
  if (!sub) redirect("/membresia");

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 text-center">
      <Clock className="size-12 text-foreground" />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Pedido registrado
      </h1>
      <p className="mt-2 text-muted-foreground max-w-md">
        Tu suscripción al plan <strong>{sub.plan.name}</strong> (
        {formatPrice(sub.plan.priceCents, { currency: sub.plan.currency })}/
        {intervalLabel(sub.plan.interval)}) quedó registrada como pendiente.
        Te avisamos por email apenas se confirme.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Volver al inicio
        </Link>
        <a
          href="mailto:hola@milagros.app"
          className={buttonVariants()}
        >
          Coordinar pago
        </a>
      </div>
    </div>
  );
}
