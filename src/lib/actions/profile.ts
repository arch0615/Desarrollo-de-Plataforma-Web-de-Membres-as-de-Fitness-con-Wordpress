"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().min(2, "Nombre muy corto").max(80),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresá tu contraseña actual"),
    newPassword: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(128)
      .regex(/[a-z]/, "Debe incluir minúsculas")
      .regex(/[A-Z]/, "Debe incluir mayúsculas")
      .regex(/\d/, "Debe incluir un número"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ProfileActionState =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

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

async function requireUser() {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

// ─── UPDATE PROFILE ──────────────────────────────────────────────────────
export async function updateProfileAction(
  _prev: ProfileActionState | undefined,
  formData: FormData,
): Promise<ProfileActionState> {
  const userId = await requireUser();
  const parsed = profileSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisá los campos.",
      fieldErrors: flatten(parsed.error),
    };
  }
  await prisma.user.update({
    where: { id: userId },
    data: { name: parsed.data.name },
  });
  revalidatePath("/app/perfil");
  return { ok: true, message: "Perfil actualizado." };
}

// ─── CHANGE PASSWORD ─────────────────────────────────────────────────────
export async function changePasswordAction(
  _prev: ProfileActionState | undefined,
  formData: FormData,
): Promise<ProfileActionState> {
  const userId = await requireUser();
  const parsed = passwordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisá los campos.",
      fieldErrors: flatten(parsed.error),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user) {
    return { ok: false, message: "Usuario no encontrado." };
  }

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) {
    return {
      ok: false,
      message: "Contraseña actual incorrecta.",
      fieldErrors: { currentPassword: "Contraseña incorrecta" },
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
  return { ok: true, message: "Contraseña actualizada." };
}
