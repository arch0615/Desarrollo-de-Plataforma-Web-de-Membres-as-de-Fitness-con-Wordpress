"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createPreapproval,
  cancelPreapproval,
  isMpConfigured,
  mpFrequencyForInterval,
  periodEndForInterval,
} from "@/lib/mercadopago";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

// ─── START CHECKOUT ──────────────────────────────────────────────────────
// Creates a pending Subscription row, then either:
//   1. Redirects to MP `init_point` if MP is configured
//   2. Redirects to /checkout/manual if not (clear instructions)
//
// Throws via `redirect()` — must be invoked from a form action.

export async function startCheckoutAction(planSlug: string) {
  const session = await auth();
  if (!session) redirect("/login?from=/checkout");

  const userId = session.user.id;
  const userEmail = session.user.email;
  if (!userEmail) redirect("/login");

  const plan = await prisma.plan.findUnique({
    where: { slug: planSlug },
  });
  if (!plan || !plan.isActive) {
    redirect("/membresia");
  }

  // Don't double-charge if there's already an active sub on the same plan.
  const existingActive = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ["active", "pending"] },
    },
    orderBy: { createdAt: "desc" },
  });
  if (existingActive && existingActive.status === "active") {
    redirect("/app/suscripcion");
  }

  // Create or reuse a pending sub for this plan.
  let pending = existingActive;
  if (!pending || pending.planId !== plan.id) {
    pending = await prisma.subscription.create({
      data: {
        userId,
        planId: plan.id,
        status: "pending",
      },
    });
  }

  if (!isMpConfigured()) {
    // Manual flow: page tells the user to wait for admin confirmation.
    redirect(`/checkout/manual?sub=${pending.id}`);
  }

  try {
    const pre = await createPreapproval({
      payerEmail: userEmail,
      reason: `${plan.name} — Milagros Fitness`,
      amountCents: plan.priceCents,
      currency: plan.currency,
      frequency: mpFrequencyForInterval(plan.interval),
      externalReference: pending.id,
      backUrl: `${appUrl()}/checkout/exito?sub=${pending.id}`,
    });
    await prisma.subscription.update({
      where: { id: pending.id },
      data: { mpPreapprovalId: pre.id },
    });
    redirect(pre.init_point);
  } catch (e) {
    // re-throw redirect; convert anything else into a redirect with error.
    if ((e as { digest?: string })?.digest?.toString().startsWith("NEXT_REDIRECT")) {
      throw e;
    }
    console.error("MP preapproval create failed:", e);
    redirect(`/checkout/error?sub=${pending.id}`);
  }
}

// ─── CANCEL ──────────────────────────────────────────────────────────────
// Member-initiated cancel: marks `cancelAtPeriodEnd=true` so access stays
// until the paid period ends. If MP knows about the sub, ask MP to cancel.

export async function cancelSubscriptionAction() {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const sub = await prisma.subscription.findFirst({
    where: { userId: session.user.id, status: { in: ["active", "past_due"] } },
    orderBy: { createdAt: "desc" },
  });
  if (!sub) {
    return { ok: false as const, message: "No tenés una suscripción activa." };
  }

  if (sub.mpPreapprovalId && isMpConfigured()) {
    try {
      await cancelPreapproval(sub.mpPreapprovalId);
    } catch (e) {
      console.error("MP cancel failed:", e);
      // Continue to mark cancel locally — webhook will reconcile if MP responds later.
    }
  }

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      cancelAtPeriodEnd: true,
      cancelledAt: new Date(),
    },
  });
  revalidatePath("/app/suscripcion");
  return {
    ok: true as const,
    message: sub.currentPeriodEnd
      ? `Tu acceso continúa hasta ${sub.currentPeriodEnd.toLocaleDateString("es-AR")}.`
      : "Cancelación registrada.",
  };
}

// ─── ADMIN MANUAL GRANT ──────────────────────────────────────────────────
// Lets Milagros activate a subscription for a member without MP — useful
// for comp accounts, manual transfers, or while MP is being set up.
// We cap to a chosen interval (defaults to the plan's interval) starting now.

export async function grantManualSubscriptionAction(
  userId: string,
  planSlug: string,
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }

  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
  if (!plan) {
    return { ok: false as const, message: "Plan no encontrado." };
  }

  const now = new Date();
  const periodEnd = periodEndForInterval(now, plan.interval);

  const existing = await prisma.subscription.findFirst({
    where: { userId, status: { in: ["pending", "past_due"] } },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        planId: plan.id,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        cancelledAt: null,
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        userId,
        planId: plan.id,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      adminId: session.user.id,
      action: "subscription.manual_grant",
      targetType: "user",
      targetId: userId,
      payload: { planSlug, periodEnd: periodEnd.toISOString() },
    },
  });

  revalidatePath("/app/suscripcion");
  revalidatePath("/admin/miembros");
  return {
    ok: true as const,
    message: `Acceso activado hasta ${periodEnd.toLocaleDateString("es-AR")}.`,
  };
}
