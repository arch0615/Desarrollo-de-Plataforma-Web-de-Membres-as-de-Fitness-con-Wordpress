import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatPrice, intervalLabel } from "@/lib/format";
import { GrantSubscriptionForm } from "./grant-subscription-form";
import { MemberControls } from "./member-controls";

export const metadata = { title: "Miembro" };

const subStatusLabel: Record<string, string> = {
  pending: "Pendiente",
  active: "Activa",
  past_due: "Pago pendiente",
  cancelled: "Cancelada",
  expired: "Vencida",
};

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [member, plans] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          include: { plan: true },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 12,
        },
      },
    }),
    prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!member) notFound();

  const currentSub = member.subscriptions[0];

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <Link
        href="/admin/miembros"
        className="text-sm text-muted-foreground underline"
      >
        ← Miembros
      </Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {member.name}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {member.email} · miembro desde{" "}
        {member.createdAt.toLocaleDateString("es-AR")}
        {member.emailVerifiedAt ? " · email verificado" : " · email sin verificar"}
      </p>

      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="font-semibold">Suscripción actual</h2>
        {currentSub ? (
          <div className="mt-2 space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Plan:</span>{" "}
              {currentSub.plan.name} (
              {formatPrice(currentSub.plan.priceCents, {
                currency: currentSub.plan.currency,
              })}
              /{intervalLabel(currentSub.plan.interval)})
            </p>
            <p>
              <span className="text-muted-foreground">Estado:</span>{" "}
              <Badge
                variant={currentSub.status === "active" ? "default" : "outline"}
              >
                {subStatusLabel[currentSub.status] ?? currentSub.status}
              </Badge>
            </p>
            {currentSub.currentPeriodEnd && (
              <p>
                <span className="text-muted-foreground">Acceso hasta:</span>{" "}
                {currentSub.currentPeriodEnd.toLocaleDateString("es-AR")}
              </p>
            )}
            {currentSub.cancelAtPeriodEnd && (
              <p className="text-amber-700 dark:text-amber-300">
                Cancelación al final del período
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Sin suscripción.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-2xl border p-6">
        <h2 className="font-semibold">Acciones</h2>
        <MemberControls
          userId={member.id}
          hasSubscription={!!currentSub}
        />
      </section>

      <section className="mt-6 rounded-2xl border p-6">
        <h2 className="font-semibold">Otorgar acceso manual</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Útil para regalos, pagos por transferencia o mientras se conecta
          Mercado Pago. Activa el acceso desde ahora hasta el final del período
          según el plan elegido.
        </p>
        <GrantSubscriptionForm userId={member.id} plans={plans} />
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">Pagos recientes</h2>
        {member.payments.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Sin pagos.</p>
        ) : (
          <div className="mt-3 rounded-2xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Fecha</th>
                  <th className="text-left px-4 py-2 font-medium">Monto</th>
                  <th className="text-left px-4 py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {member.payments.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">
                      {(p.paidAt ?? p.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-2">
                      {formatPrice(p.amountCents, { currency: p.currency })}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant="outline">{p.status}</Badge>
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
