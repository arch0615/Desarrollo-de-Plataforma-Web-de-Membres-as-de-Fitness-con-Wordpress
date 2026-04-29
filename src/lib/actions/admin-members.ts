"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createEmailToken } from "@/lib/tokens";
import { sendEmail, resetEmailTemplate } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

// ─── EXTEND PERIOD ───────────────────────────────────────────────────────
export async function extendSubscriptionAction(
  userId: string,
  days: number,
) {
  const session = await requireAdmin();
  if (!Number.isFinite(days) || days <= 0 || days > 365) {
    return { ok: false as const, message: "Días inválidos (1-365)." };
  }

  const sub = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  if (!sub) {
    return { ok: false as const, message: "Sin suscripción para extender." };
  }

  const base =
    sub.currentPeriodEnd && sub.currentPeriodEnd > new Date()
      ? sub.currentPeriodEnd
      : new Date();
  const newEnd = new Date(base.getTime() + days * 86400_000);

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: "active",
      currentPeriodStart: sub.currentPeriodStart ?? new Date(),
      currentPeriodEnd: newEnd,
      cancelAtPeriodEnd: false,
      cancelledAt: null,
    },
  });

  await prisma.auditLog.create({
    data: {
      adminId: session.user.id,
      action: "subscription.extend",
      targetType: "user",
      targetId: userId,
      payload: { days, newEnd: newEnd.toISOString() },
    },
  });

  revalidatePath("/admin/miembros");
  revalidatePath(`/admin/miembros/${userId}`);
  return {
    ok: true as const,
    message: `Acceso extendido hasta ${newEnd.toLocaleDateString("es-AR")}.`,
  };
}

// ─── SUSPEND ─────────────────────────────────────────────────────────────
// Marks the latest subscription expired, immediate revoke. Different from
// member-initiated cancel (which preserves access until period end).
export async function suspendMemberAction(userId: string) {
  const session = await requireAdmin();
  const sub = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  if (!sub) {
    return { ok: false as const, message: "Sin suscripción para suspender." };
  }
  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: "expired",
      cancelledAt: new Date(),
      cancelAtPeriodEnd: false,
    },
  });
  await prisma.auditLog.create({
    data: {
      adminId: session.user.id,
      action: "subscription.suspend",
      targetType: "user",
      targetId: userId,
    },
  });
  revalidatePath("/admin/miembros");
  revalidatePath(`/admin/miembros/${userId}`);
  return { ok: true as const, message: "Acceso suspendido." };
}

// ─── SEND PASSWORD-RESET LINK (admin-initiated) ──────────────────────────
export async function sendPasswordResetAction(userId: string) {
  const session = await requireAdmin();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
  if (!user) {
    return { ok: false as const, message: "Miembro no encontrado." };
  }
  const token = await createEmailToken(user.id, "reset");
  const url = `${appUrl()}/restablecer/${token}`;
  await sendEmail({
    to: user.email,
    subject: "Restablecé tu contraseña — Milagros Fitness",
    html: resetEmailTemplate({ name: user.name, url }),
  });
  await prisma.auditLog.create({
    data: {
      adminId: session.user.id,
      action: "user.password_reset_sent",
      targetType: "user",
      targetId: user.id,
    },
  });
  return {
    ok: true as const,
    message: `Email de reset enviado a ${user.email}.`,
  };
}
