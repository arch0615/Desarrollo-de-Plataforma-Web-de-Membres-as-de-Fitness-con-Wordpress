"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import {
  registerSchema,
  loginSchema,
  forgotSchema,
  resetSchema,
} from "@/lib/validators";
import { createEmailToken, consumeEmailToken } from "@/lib/tokens";
import {
  sendEmail,
  verifyEmailTemplate,
  resetEmailTemplate,
} from "@/lib/email";

export type ActionState =
  | { ok: true; message?: string; redirectTo?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function flatten(error: unknown): Record<string, string> {
  if (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as { issues: unknown }).issues)
  ) {
    const out: Record<string, string> = {};
    for (const i of (error as { issues: { path: (string | number)[]; message: string }[] }).issues) {
      const k = i.path.join(".");
      if (!out[k]) out[k] = i.message;
    }
    return out;
  }
  return {};
}

// ─── REGISTER ────────────────────────────────────────────────────────────
export async function registerAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    acceptTerms: formData.get("acceptTerms") === "on",
  };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisá los campos marcados.",
      fieldErrors: flatten(parsed.error),
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      message: "Ya existe una cuenta con este email.",
      fieldErrors: { email: "Email en uso" },
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
      role: "member",
    },
    select: { id: true, email: true, name: true },
  });

  const token = await createEmailToken(user.id, "verify");
  const url = `${appUrl()}/verificar/${token}`;
  await sendEmail({
    to: user.email,
    subject: "Verificá tu email — Milagros Fitness",
    html: verifyEmailTemplate({ name: user.name, url }),
  });

  return {
    ok: true,
    message:
      "¡Listo! Te enviamos un email para verificar tu cuenta. Revisá tu bandeja de entrada.",
  };
}

// ─── LOGIN ───────────────────────────────────────────────────────────────
export async function loginAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisá los campos marcados.",
      fieldErrors: flatten(parsed.error),
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("ACCOUNT_NOT_VERIFIED")) {
      return {
        ok: false,
        message:
          "Tu cuenta no está verificada. Revisá tu email o pedí un nuevo link.",
      };
    }
    return { ok: false, message: "Email o contraseña incorrectos." };
  }

  redirect("/app");
}

// ─── LOGOUT ──────────────────────────────────────────────────────────────
export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

// ─── FORGOT PASSWORD ─────────────────────────────────────────────────────
export async function forgotAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const raw = { email: String(formData.get("email") ?? "").trim().toLowerCase() };
  const parsed = forgotSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Email inválido.",
      fieldErrors: flatten(parsed.error),
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, name: true, email: true },
  });

  // Don't leak existence — same response either way.
  if (user) {
    const token = await createEmailToken(user.id, "reset");
    const url = `${appUrl()}/restablecer/${token}`;
    await sendEmail({
      to: user.email,
      subject: "Restablecé tu contraseña — Milagros Fitness",
      html: resetEmailTemplate({ name: user.name, url }),
    });
  }

  return {
    ok: true,
    message:
      "Si el email existe en nuestro sistema, te enviamos un link para restablecer tu contraseña.",
  };
}

// ─── RESET PASSWORD ──────────────────────────────────────────────────────
export async function resetAction(
  token: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
  const parsed = resetSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisá los campos marcados.",
      fieldErrors: flatten(parsed.error),
    };
  }

  const result = await consumeEmailToken(token, "reset");
  if (!result.ok) {
    return {
      ok: false,
      message:
        result.reason === "expired"
          ? "El link expiró. Pedí uno nuevo."
          : "Link inválido o ya usado.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({
    where: { id: result.userId },
    data: { passwordHash },
  });
  return {
    ok: true,
    message: "Tu contraseña fue actualizada. Ya podés iniciar sesión.",
    redirectTo: "/login",
  };
}

// ─── VERIFY EMAIL ────────────────────────────────────────────────────────
export async function verifyEmailAction(token: string) {
  const result = await consumeEmailToken(token, "verify");
  if (!result.ok) return result;
  await prisma.user.update({
    where: { id: result.userId },
    data: { emailVerifiedAt: new Date() },
  });
  return { ok: true as const };
}
