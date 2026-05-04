import Link from "next/link";
import { CreditCard, Sparkles, AlertCircle, Receipt } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice, intervalLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CancelSubscriptionButton } from "./cancel-button";

export const metadata = { title: "Suscripción" };

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  active: "Activa",
  past_due: "Pago pendiente",
  cancelled: "Cancelada",
  expired: "Vencida",
};

const statusClass: Record<string, string> = {
  pending: "bg-brand-amber/15 text-brand-amber border-0",
  active: "bg-emerald-500/15 text-emerald-600 border-0",
  past_due: "bg-destructive/15 text-destructive border-0",
  cancelled: "bg-muted text-muted-foreground border-0",
  expired: "bg-muted text-muted-foreground border-0",
};

const paymentStatusClass: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-600 border-0",
  pending: "bg-brand-amber/15 text-brand-amber border-0",
  rejected: "bg-destructive/15 text-destructive border-0",
};

export default async function SubscriptionPage() {
  const session = await auth();
  const userId = session!.user.id;

  const sub = await prisma.subscription.findFirst({
    where: { userId },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10 max-w-3xl">
      <header>
        <Badge
          variant="secondary"
          className="bg-brand-coral/10 text-brand-coral border-0"
        >
          <CreditCard className="size-3.5" />
          Suscripción
        </Badge>
        <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
          Tu <span className="text-gradient-sunset">plan</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Próximos cobros e historial de pagos.
        </p>
      </header>

      {!sub ? (
        <div className="mt-8 relative rounded-3xl border-2 border-dashed border-brand-coral/30 bg-brand-coral/5 p-10 text-center">
          <div className="size-12 mx-auto rounded-2xl bg-sunset grid place-items-center shadow-lg shadow-brand-coral/30">
            <Sparkles className="size-5 text-white" />
          </div>
          <p className="mt-4 font-semibold text-lg">
            Aún no tenés una suscripción activa
          </p>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            Elegí un plan para acceder a la biblioteca completa.
          </p>
          <Link
            href="/membresia"
            className={cn(
              buttonVariants({ size: "default" }),
              "mt-5 bg-sunset border-0 text-white shadow-md shadow-brand-coral/25 hover:opacity-95",
            )}
          >
            Ver planes
          </Link>
        </div>
      ) : (
        <section className="mt-8 relative isolate rounded-3xl overflow-hidden bg-plum-hero texture-grain p-7 sm:p-8">
          <div className="absolute -top-10 -right-10 size-44 rounded-full bg-brand-coral/30 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 size-44 rounded-full bg-brand-amber/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-brand-amber">
                  Tu plan
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {sub.plan.name}
                </p>
                <p className="mt-1 text-white/70">
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(sub.plan.priceCents, {
                      currency: sub.plan.currency,
                    })}
                  </span>{" "}
                  / {intervalLabel(sub.plan.interval)}
                </p>
              </div>
              <Badge
                className={cn(
                  "text-sm py-1 px-3",
                  statusClass[sub.status] ?? "bg-white/15 text-white border-0",
                )}
              >
                {statusLabel[sub.status] ?? sub.status}
              </Badge>
            </div>

            <dl className="mt-7 grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/15">
                <dt className="text-xs uppercase tracking-wider font-semibold text-white/60">
                  Inicio del período
                </dt>
                <dd className="mt-1 font-semibold text-white">
                  {sub.currentPeriodStart
                    ? sub.currentPeriodStart.toLocaleDateString("es-AR")
                    : "—"}
                </dd>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/15">
                <dt className="text-xs uppercase tracking-wider font-semibold text-white/60">
                  {sub.cancelAtPeriodEnd ? "Acceso hasta" : "Próximo cobro"}
                </dt>
                <dd className="mt-1 font-semibold text-white">
                  {sub.currentPeriodEnd
                    ? sub.currentPeriodEnd.toLocaleDateString("es-AR")
                    : "—"}
                </dd>
              </div>
            </dl>

            {sub.cancelAtPeriodEnd && (
              <div className="mt-5 rounded-xl bg-brand-amber/15 border border-brand-amber/30 px-4 py-3 flex items-start gap-2.5">
                <AlertCircle className="size-4 text-brand-amber shrink-0 mt-0.5" />
                <p className="text-sm text-white/90">
                  Tu suscripción quedó cancelada. Tenés acceso hasta el final
                  del período.
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {sub.status === "active" && !sub.cancelAtPeriodEnd && (
                <CancelSubscriptionButton periodEnd={sub.currentPeriodEnd} />
              )}
              <Link
                href="/membresia"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "bg-white/10 border-white/30 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white",
                )}
              >
                Cambiar plan
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Receipt className="size-5 text-brand-coral" />
          Historial de pagos
        </h2>
        {payments.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Aún no hay pagos registrados.
          </p>
        ) : (
          <div className="mt-4 rounded-2xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Fecha</th>
                  <th className="text-left px-4 py-3 font-semibold">Monto</th>
                  <th className="text-left px-4 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      {(p.paidAt ?? p.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatPrice(p.amountCents, { currency: p.currency })}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={cn(
                          paymentStatusClass[p.status] ??
                            "bg-muted text-muted-foreground border-0",
                        )}
                      >
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
