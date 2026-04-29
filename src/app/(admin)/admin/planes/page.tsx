import { prisma } from "@/lib/prisma";
import { PlansEditor } from "./plans-editor";

export const metadata = { title: "Planes" };
export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { subscriptions: true } } },
  });

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Planes</h1>
      <p className="mt-1 text-muted-foreground">
        Precios y duración de las suscripciones. Los planes con suscripciones
        existentes no se eliminan; podés desactivarlos para ocultarlos en
        /membresia.
      </p>
      <PlansEditor
        items={plans.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          interval: p.interval,
          priceCents: p.priceCents,
          currency: p.currency,
          isActive: p.isActive,
          sortOrder: p.sortOrder,
          features: Array.isArray(p.features) ? (p.features as string[]) : [],
          subCount: p._count.subscriptions,
        }))}
      />
    </div>
  );
}
