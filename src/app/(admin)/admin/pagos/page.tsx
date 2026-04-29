import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { ApprovePaymentButton } from "./approve-payment-button";

export const metadata = { title: "Pagos" };
export const dynamic = "force-dynamic";

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  approved: "default",
  pending: "secondary",
  rejected: "destructive",
  refunded: "outline",
};

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status;

  const payments = await prisma.payment.findMany({
    where: {
      ...(status
        ? { status: status as "approved" | "pending" | "rejected" | "refunded" }
        : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      subscription: { include: { plan: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-3xl font-semibold tracking-tight">Pagos</h1>
      <p className="mt-1 text-muted-foreground">
        Historial de pagos. Aprobá manualmente los pendientes (transferencia,
        flujos sin Mercado Pago).
      </p>

      <form className="mt-6 flex gap-2" action="/admin/pagos">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobado</option>
          <option value="rejected">Rechazado</option>
          <option value="refunded">Reembolsado</option>
        </select>
        <button
          type="submit"
          className="rounded-lg border px-3 py-2 text-sm hover:bg-accent"
        >
          Filtrar
        </button>
      </form>

      <div className="mt-6 rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Fecha</th>
              <th className="text-left px-4 py-2 font-medium">Miembro</th>
              <th className="text-left px-4 py-2 font-medium">Plan</th>
              <th className="text-left px-4 py-2 font-medium">Monto</th>
              <th className="text-left px-4 py-2 font-medium">Estado</th>
              <th className="text-right px-4 py-2 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  Sin pagos para este filtro.
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3 text-muted-foreground">
                  {(p.paidAt ?? p.createdAt).toLocaleDateString("es-AR")}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/miembros/${p.user.id}`}
                    className="font-medium hover:underline"
                  >
                    {p.user.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{p.user.email}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.subscription?.plan.name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {formatPrice(p.amountCents, { currency: p.currency })}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[p.status] ?? "outline"}>
                    {p.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {p.status === "pending" ? (
                    <ApprovePaymentButton paymentId={p.id} />
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
