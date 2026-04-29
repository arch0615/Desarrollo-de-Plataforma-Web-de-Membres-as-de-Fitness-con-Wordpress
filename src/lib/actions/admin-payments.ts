"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { periodEndForInterval } from "@/lib/mercadopago";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

// Mark a pending Payment as approved (manual / offline flow). Also activates
// the linked subscription if it isn't already.
export async function markPaymentApprovedAction(paymentId: string) {
  const session = await requireAdmin();
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { subscription: { include: { plan: true } } },
  });
  if (!payment) {
    return { ok: false as const, message: "Pago no encontrado." };
  }
  if (payment.status === "approved") {
    return { ok: false as const, message: "Este pago ya está aprobado." };
  }

  const now = new Date();
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "approved", paidAt: now },
  });

  if (payment.subscription) {
    const start = payment.subscription.currentPeriodStart ?? now;
    const end = payment.subscription.currentPeriodEnd ?? periodEndForInterval(start, payment.subscription.plan.interval);
    await prisma.subscription.update({
      where: { id: payment.subscription.id },
      data: {
        status: "active",
        currentPeriodStart: start,
        currentPeriodEnd: end,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      adminId: session.user.id,
      action: "payment.mark_approved",
      targetType: "payment",
      targetId: payment.id,
      payload: { amount: payment.amountCents, currency: payment.currency },
    },
  });

  revalidatePath("/admin/pagos");
  revalidatePath("/admin/suscripciones");
  return { ok: true as const, message: "Pago marcado como aprobado." };
}

// Record a manual payment for a user. Useful for offline transfers when
// MP isn't in the loop. Creates a pending Payment row tied to the user's
// most recent subscription (or a fresh sub if none).
export async function recordManualPaymentAction(
  userId: string,
  planSlug: string,
  amountCents: number,
) {
  const session = await requireAdmin();
  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
  if (!plan) {
    return { ok: false as const, message: "Plan no encontrado." };
  }

  let sub = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  if (!sub) {
    sub = await prisma.subscription.create({
      data: { userId, planId: plan.id, status: "pending" },
    });
  }

  const payment = await prisma.payment.create({
    data: {
      userId,
      subscriptionId: sub.id,
      amountCents,
      currency: plan.currency,
      status: "pending",
    },
  });

  await prisma.auditLog.create({
    data: {
      adminId: session.user.id,
      action: "payment.manual_record",
      targetType: "payment",
      targetId: payment.id,
      payload: { amountCents, currency: plan.currency, planSlug },
    },
  });

  revalidatePath("/admin/pagos");
  return {
    ok: true as const,
    message: `Pago registrado como pendiente. Aprobá para activar la sub.`,
  };
}
