import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatPrice, intervalLabel } from "@/lib/format";

export const metadata = { title: "Suscripciones" };
export const dynamic = "force-dynamic";

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
  active: "default",
  pending: "secondary",
  past_due: "destructive",
  cancelled: "outline",
  expired: "outline",
};

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status;

  const subs = await prisma.subscription.findMany({
    where: {
      ...(status
        ? {
            status: status as
              | "pending"
              | "active"
              | "past_due"
              | "cancelled"
              | "expired",
          }
        : {}),
    },
    include: { user: { select: { id: true, name: true, email: true } }, plan: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-3xl font-semibold tracking-tight">Suscripciones</h1>
      <p className="mt-1 text-muted-foreground">
        Estado de todas las suscripciones.
      </p>

      <form className="mt-6 flex gap-2" action="/admin/suscripciones">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="pending">Pendiente</option>
          <option value="past_due">Pago pendiente</option>
          <option value="cancelled">Cancelada</option>
          <option value="expired">Vencida</option>
        </select>
        <button
          type="submit"
          className="rounded-lg border px-3 py-2 text-sm hover:bg-accent"
        >
          Filtrar
        </button>
      </form>

      <div className="mt-6 rounded-2xl border overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Miembro</th>
              <th className="text-left px-4 py-2 font-medium">Plan</th>
              <th className="text-left px-4 py-2 font-medium">Estado</th>
              <th className="text-left px-4 py-2 font-medium">Período</th>
              <th className="text-right px-4 py-2 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  Sin suscripciones para este filtro.
                </td>
              </tr>
            )}
            {subs.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3">
                  <p className="font-medium">{s.user.name}</p>
                  <p className="text-xs text-muted-foreground">{s.user.email}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.plan.name}{" "}
                  <span className="text-xs">
                    ({formatPrice(s.plan.priceCents, { currency: s.plan.currency })}/
                    {intervalLabel(s.plan.interval)})
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[s.status] ?? "outline"}>
                    {statusLabel[s.status] ?? s.status}
                  </Badge>
                  {s.cancelAtPeriodEnd && (
                    <span className="ml-1 text-xs text-amber-700 dark:text-amber-400">
                      cancela al final
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.currentPeriodStart && s.currentPeriodEnd
                    ? `${s.currentPeriodStart.toLocaleDateString("es-AR")} → ${s.currentPeriodEnd.toLocaleDateString("es-AR")}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/miembros/${s.user.id}`}
                    className="text-sm underline"
                  >
                    Ver miembro
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
