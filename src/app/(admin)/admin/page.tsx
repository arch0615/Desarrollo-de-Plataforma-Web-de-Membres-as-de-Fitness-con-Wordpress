import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [members, classes, plans, payments] = await Promise.all([
    prisma.user.count({ where: { role: "member" } }),
    prisma.class.count(),
    prisma.plan.count({ where: { isActive: true } }),
    prisma.payment.count({ where: { status: "approved" } }),
  ]);

  const cards = [
    { label: "Miembros", value: members },
    { label: "Clases", value: classes },
    { label: "Planes activos", value: plans },
    { label: "Pagos aprobados", value: payments },
  ];

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">
        Visión general de la plataforma.
      </p>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border p-4">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
