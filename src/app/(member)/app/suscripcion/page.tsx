import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice, intervalLabel } from "@/lib/format";
import { CancelSubscriptionButton } from "./cancel-button";

export const metadata = { title: "Suscripción" };

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  active: "Activa",
  past_due: "Pago pendiente",
  cancelled: "Cancelada",
  expired: "Vencida",
};

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "secondary",
  active: "default",
  past_due: "destructive",
  cancelled: "outline",
  expired: "outline",
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
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
        Suscripción
      </h1>
      <p className="mt-1 text-muted-foreground">
        Tu plan, próximos cobros e historial de pagos.
      </p>

      {!sub ? (
        <div className="mt-8 rounded-2xl border p-8 text-center bg-accent/30">
          <p className="font-medium">Aún no tenés una suscripción activa</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Elegí un plan para acceder a la biblioteca completa.
          </p>
          <Link
            href="/membresia"
            className={buttonVariants({ className: "mt-4" })}
          >
            Ver planes
          </Link>
        </div>
      ) : (
        <section className="mt-8 rounded-2xl border p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Tu plan
              </p>
              <p className="mt-1 text-xl font-semibold">{sub.plan.name}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {formatPrice(sub.plan.priceCents, { currency: sub.plan.currency })}{" "}
                por {intervalLabel(sub.plan.interval)}
              </p>
            </div>
            <Badge variant={statusVariant[sub.status] ?? "outline"}>
              {statusLabel[sub.status] ?? sub.status}
            </Badge>
          </div>

          <dl className="mt-5 grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Inicio del período</dt>
              <dd className="font-medium">
                {sub.currentPeriodStart
                  ? sub.currentPeriodStart.toLocaleDateString("es-AR")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {sub.cancelAtPeriodEnd
                  ? "Acceso hasta"
                  : "Próximo cobro"}
              </dt>
              <dd className="font-medium">
                {sub.currentPeriodEnd
                  ? sub.currentPeriodEnd.toLocaleDateString("es-AR")
                  : "—"}
              </dd>
            </div>
          </dl>

          {sub.cancelAtPeriodEnd && (
            <p className="mt-4 text-sm rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-300 px-3 py-2">
              Tu suscripción quedó cancelada. Tenés acceso hasta el final del
              período.
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {sub.status === "active" && !sub.cancelAtPeriodEnd && (
              <CancelSubscriptionButton periodEnd={sub.currentPeriodEnd} />
            )}
            <Link
              href="/membresia"
              className={buttonVariants({ variant: "outline" })}
            >
              Cambiar plan
            </Link>
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">
          Historial de pagos
        </h2>
        {payments.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Aún no hay pagos registrados.
          </p>
        ) : (
          <div className="mt-4 rounded-2xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Fecha</th>
                  <th className="text-left px-4 py-2 font-medium">Monto</th>
                  <th className="text-left px-4 py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">
                      {(p.paidAt ?? p.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-2">
                      {formatPrice(p.amountCents, { currency: p.currency })}
                    </td>
                    <td className="px-4 py-2">
                      <Badge
                        variant={
                          p.status === "approved"
                            ? "default"
                            : p.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
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
