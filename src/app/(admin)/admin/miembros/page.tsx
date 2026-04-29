import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Miembros" };

const subStatusLabel: Record<string, string> = {
  pending: "Pendiente",
  active: "Activa",
  past_due: "Pago pendiente",
  cancelled: "Cancelada",
  expired: "Vencida",
};

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";

  const members = await prisma.user.findMany({
    where: {
      role: "member",
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { plan: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-3xl font-semibold tracking-tight">Miembros</h1>
      <p className="mt-1 text-muted-foreground">
        Buscá, otorgá acceso manual o revisá el estado de las suscripciones.
      </p>

      <form className="mt-6 flex gap-2 max-w-md" action="/admin/miembros">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por email o nombre…"
          className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg border px-3 py-2 text-sm hover:bg-accent"
        >
          Buscar
        </button>
      </form>

      <div className="mt-6 rounded-2xl border overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Miembro</th>
              <th className="text-left px-4 py-2 font-medium">Plan</th>
              <th className="text-left px-4 py-2 font-medium">Estado</th>
              <th className="text-left px-4 py-2 font-medium">Acceso hasta</th>
              <th className="text-right px-4 py-2 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  No hay miembros{q && ` que coincidan con "${q}"`}.
                </td>
              </tr>
            )}
            {members.map((m) => {
              const s = m.subscriptions[0];
              return (
                <tr key={m.id} className="border-t">
                  <td className="px-4 py-3">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s?.plan.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {s ? (
                      <Badge variant={s.status === "active" ? "default" : "outline"}>
                        {subStatusLabel[s.status] ?? s.status}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Sin sub</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s?.currentPeriodEnd
                      ? s.currentPeriodEnd.toLocaleDateString("es-AR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/miembros/${m.id}`}
                      className="text-sm underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
