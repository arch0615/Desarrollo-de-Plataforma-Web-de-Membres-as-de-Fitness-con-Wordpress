"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

const emailSchema = z.string().email();

export async function sendTestEmailAction(to: string) {
  await requireAdmin();
  const parsed = emailSchema.safeParse(to);
  if (!parsed.success) {
    return { ok: false as const, message: "Email inválido." };
  }
  try {
    await sendEmail({
      to: parsed.data,
      subject: "Test — Milagros Fitness",
      html: `<p>Hola,</p><p>Este es un email de prueba enviado desde el panel de administración.</p><p>Si lo ves, la integración de email está funcionando.</p>`,
    });
    return {
      ok: true as const,
      message: process.env.RESEND_API_KEY
        ? `Email enviado a ${parsed.data}.`
        : `Sin RESEND_API_KEY: el cuerpo se imprimió en la consola del servidor.`,
    };
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Error al enviar.",
    };
  }
}
