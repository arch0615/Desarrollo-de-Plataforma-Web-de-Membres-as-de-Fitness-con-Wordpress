import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { getPreapproval, isMpConfigured } from "@/lib/mercadopago";

export const metadata = { title: "¡Bienvenida!" };

// MP redirects here after the user completes (or attempts) the payment.
// We poll the preapproval status once to give an immediate hint, but the
// authoritative state update comes via the webhook.

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ sub?: string; preapproval_id?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const subId = sp.sub;
  if (!subId) redirect("/app");

  const sub = await prisma.subscription.findFirst({
    where: { id: subId, userId: session.user.id },
    include: { plan: true },
  });
  if (!sub) redirect("/app");

  // Best-effort sync: ask MP for current status.
  if (sub.mpPreapprovalId && isMpConfigured() && sub.status === "pending") {
    try {
      const fresh = await getPreapproval(sub.mpPreapprovalId);
      if (fresh.status === "authorized") {
        const start = new Date();
        const end = new Date(start);
        const months =
          sub.plan.interval === "month"
            ? 1
            : sub.plan.interval === "quarter"
              ? 3
              : 12;
        end.setMonth(end.getMonth() + months);
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: "active",
            currentPeriodStart: start,
            currentPeriodEnd: end,
          },
        });
      }
    } catch (e) {
      console.error("MP sync on success failed:", e);
    }
  }

  const refreshed = await prisma.subscription.findUnique({
    where: { id: sub.id },
    include: { plan: true },
  });

  const isActive = refreshed?.status === "active";

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 text-center">
      <CheckCircle2 className="size-12 text-foreground" />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        {isActive ? "¡Bienvenida!" : "Recibimos tu pago"}
      </h1>
      <p className="mt-2 text-muted-foreground max-w-md">
        {isActive
          ? `Tu plan ${refreshed?.plan.name} está activo. Empezá a entrenar.`
          : "Estamos confirmando el pago con Mercado Pago. En menos de un minuto vas a recibir acceso completo."}
      </p>
      <Link
        href="/app"
        className={buttonVariants({ size: "lg", className: "mt-6" })}
      >
        Ir a mi cuenta
      </Link>
    </div>
  );
}
