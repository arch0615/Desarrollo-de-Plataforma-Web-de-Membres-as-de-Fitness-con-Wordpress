import Link from "next/link";
import {
  Users,
  CreditCard,
  CircleDollarSign,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { intervalMonths } from "@/lib/format";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);

  const [
    activeMembers,
    totalMembers,
    signups7,
    signups30,
    pendingPayments,
    activeSubs,
    topClasses,
    recentActions,
  ] = await Promise.all([
    prisma.subscription.count({
      where: {
        status: "active",
        OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: now } }],
      },
    }),
    prisma.user.count({ where: { role: "member" } }),
    prisma.user.count({
      where: { role: "member", createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.user.count({
      where: { role: "member", createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.payment.count({ where: { status: "pending" } }),
    prisma.subscription.findMany({
      where: {
        status: "active",
        OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: now } }],
      },
      include: { plan: true },
    }),
    prisma.classView.groupBy({
      by: ["classId"],
      _count: { classId: true },
      orderBy: { _count: { classId: "desc" } },
      take: 5,
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { admin: { select: { name: true } } },
    }),
  ]);

  // MRR: sum each active sub's monthly equivalent
  const mrrCents = activeSubs.reduce((acc, s) => {
    const months = intervalMonths(s.plan.interval);
    return acc + Math.round(s.plan.priceCents / months);
  }, 0);

  const topClassIds = topClasses.map((t) => t.classId);
  const topClassDetails = topClassIds.length
    ? await prisma.class.findMany({
        where: { id: { in: topClassIds } },
        include: { category: true },
      })
    : [];
  const topByCount = topClasses.map((t) => ({
    cls: topClassDetails.find((c) => c.id === t.classId),
    views: t._count.classId,
  }));

  const cards = [
    {
      label: "Miembros con acceso",
      value: activeMembers,
      icon: Users,
      sub: `${totalMembers} cuentas en total`,
    },
    {
      label: "MRR estimado",
      value: formatPrice(mrrCents),
      icon: CircleDollarSign,
      sub: "Suma mensual de las suscripciones activas",
    },
    {
      label: "Nuevas cuentas — 7 días",
      value: signups7,
      icon: TrendingUp,
      sub: `${signups30} en los últimos 30 días`,
    },
    {
      label: "Pagos pendientes",
      value: pendingPayments,
      icon: CreditCard,
      sub: pendingPayments > 0 ? "Revisá /admin/pagos" : "Todo al día",
    },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Visión general de la plataforma.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <c.icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-semibold">{c.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            Clases más vistas
          </h2>
          {topByCount.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay vistas registradas.
            </p>
          ) : (
            <div className="rounded-2xl border divide-y">
              {topByCount.map(
                ({ cls, views }) =>
                  cls && (
                    <div
                      key={cls.id}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/admin/clases/${cls.id}`}
                          className="font-medium hover:underline line-clamp-1"
                        >
                          {cls.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {cls.category.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                        <PlayCircle className="size-4" />
                        {views}
                      </div>
                    </div>
                  ),
              )}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            Actividad reciente
          </h2>
          {recentActions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sin actividad de admin todavía.
            </p>
          ) : (
            <ul className="rounded-2xl border divide-y text-sm">
              {recentActions.map((a) => (
                <li key={a.id} className="p-3">
                  <p>
                    <span className="font-medium">
                      {a.admin?.name ?? "admin"}
                    </span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <Badge variant="outline" className="text-[10px]">
                      {a.targetType}
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a.createdAt.toLocaleString("es-AR")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
