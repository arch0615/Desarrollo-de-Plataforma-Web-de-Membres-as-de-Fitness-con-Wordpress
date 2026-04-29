"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureUniqueSlug } from "@/lib/slug";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

// ─── CATEGORIES ──────────────────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().min(2).max(60),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) {
    return { ok: false as const, message: "Nombre inválido." };
  }
  const slug = await ensureUniqueSlug(parsed.data.name, async (s) =>
    !!(await prisma.category.findUnique({
      where: { slug: s },
      select: { id: true },
    })),
  );
  await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      sortOrder: parsed.data.sortOrder,
    },
  });
  revalidatePath("/admin/categorias");
  return { ok: true as const, message: "Categoría creada." };
}

export async function updateCategoryAction(
  categoryId: string,
  formData: FormData,
) {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) {
    return { ok: false as const, message: "Nombre inválido." };
  }
  await prisma.category.update({
    where: { id: categoryId },
    data: { name: parsed.data.name, sortOrder: parsed.data.sortOrder },
  });
  revalidatePath("/admin/categorias");
  return { ok: true as const, message: "Categoría actualizada." };
}

export async function deleteCategoryAction(categoryId: string) {
  await requireAdmin();
  const count = await prisma.class.count({ where: { categoryId } });
  if (count > 0) {
    return {
      ok: false as const,
      message: `No se puede eliminar: ${count} clase${count === 1 ? "" : "s"} usan esta categoría.`,
    };
  }
  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/categorias");
  return { ok: true as const, message: "Categoría eliminada." };
}

// ─── PLANS ───────────────────────────────────────────────────────────────

const planSchema = z.object({
  name: z.string().min(2).max(40),
  interval: z.enum(["month", "quarter", "year"]),
  priceCents: z.coerce.number().int().min(100), // at least 1 unit
  currency: z.string().min(3).max(4).default("ARS"),
  features: z.string().optional(), // newline-separated
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

function parseFeatures(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export async function createPlanAction(formData: FormData) {
  await requireAdmin();
  const parsed = planSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    interval: formData.get("interval"),
    priceCents: formData.get("priceCents"),
    currency: String(formData.get("currency") ?? "ARS")
      .trim()
      .toUpperCase(),
    features: formData.get("features"),
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Datos inválidos: " + parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  const slug = await ensureUniqueSlug(parsed.data.name, async (s) =>
    !!(await prisma.plan.findUnique({
      where: { slug: s },
      select: { id: true },
    })),
  );
  await prisma.plan.create({
    data: {
      name: parsed.data.name,
      slug,
      interval: parsed.data.interval,
      priceCents: parsed.data.priceCents,
      currency: parsed.data.currency,
      features: parseFeatures(parsed.data.features),
      sortOrder: parsed.data.sortOrder,
      isActive: true,
    },
  });
  revalidatePath("/admin/planes");
  revalidatePath("/membresia");
  return { ok: true as const, message: "Plan creado." };
}

export async function updatePlanAction(planId: string, formData: FormData) {
  await requireAdmin();
  const parsed = planSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    interval: formData.get("interval"),
    priceCents: formData.get("priceCents"),
    currency: String(formData.get("currency") ?? "ARS")
      .trim()
      .toUpperCase(),
    features: formData.get("features"),
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Datos inválidos: " + parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  await prisma.plan.update({
    where: { id: planId },
    data: {
      name: parsed.data.name,
      interval: parsed.data.interval,
      priceCents: parsed.data.priceCents,
      currency: parsed.data.currency,
      features: parseFeatures(parsed.data.features),
      sortOrder: parsed.data.sortOrder,
    },
  });
  revalidatePath("/admin/planes");
  revalidatePath("/membresia");
  return { ok: true as const, message: "Plan actualizado." };
}

export async function togglePlanActiveAction(planId: string) {
  await requireAdmin();
  const p = await prisma.plan.findUnique({
    where: { id: planId },
    select: { isActive: true },
  });
  if (!p) return { ok: false as const, message: "Plan no encontrado." };
  await prisma.plan.update({
    where: { id: planId },
    data: { isActive: !p.isActive },
  });
  revalidatePath("/admin/planes");
  revalidatePath("/membresia");
  return {
    ok: true as const,
    message: p.isActive ? "Plan desactivado." : "Plan activado.",
  };
}
