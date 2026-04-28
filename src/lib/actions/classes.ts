"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureUniqueSlug } from "@/lib/slug";
import {
  classCreateSchema,
  classUpdateSchema,
} from "@/lib/validators-admin";
import { createVideo, deleteVideo, isBunnyConfigured } from "@/lib/bunny";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

function parseFormData(formData: FormData) {
  const equipment = (formData.get("equipment") as string | null) ?? "";
  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    categoryId: String(formData.get("categoryId") ?? ""),
    level: (formData.get("level") as string) ?? "beginner",
    durationSeconds: formData.get("durationSeconds") ?? 0,
    equipment: equipment
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export type AdminActionState =
  | { ok: true; message?: string; classId?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

function flattenZod(error: unknown): Record<string, string> {
  if (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as { issues: unknown }).issues)
  ) {
    const out: Record<string, string> = {};
    for (const i of (error as { issues: { path: (string | number)[]; message: string }[] }).issues) {
      const k = i.path.join(".") || "_form";
      if (!out[k]) out[k] = i.message;
    }
    return out;
  }
  return {};
}

// ─── CREATE ──────────────────────────────────────────────────────────────
export async function createClassAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = classCreateSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisá los campos marcados.",
      fieldErrors: flattenZod(parsed.error),
    };
  }

  const slug = await ensureUniqueSlug(parsed.data.title, async (s) =>
    !!(await prisma.class.findUnique({ where: { slug: s }, select: { id: true } })),
  );

  // Create the Bunny video shell at create-time so the upload can proceed
  // immediately from the editor. If Bunny is not configured, leave bunnyVideoId
  // null and the editor will display a configuration banner.
  let bunnyVideoId: string | null = null;
  if (isBunnyConfigured()) {
    try {
      const r = await createVideo(parsed.data.title);
      bunnyVideoId = r.videoId;
    } catch (e) {
      console.error("Failed to create Bunny video:", e);
    }
  }

  const created = await prisma.class.create({
    data: {
      slug,
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      categoryId: parsed.data.categoryId,
      level: parsed.data.level,
      durationSeconds: parsed.data.durationSeconds,
      equipment: parsed.data.equipment,
      bunnyVideoId,
      status: "draft",
    },
    select: { id: true },
  });

  revalidatePath("/admin/clases");
  redirect(`/admin/clases/${created.id}`);
}

// ─── UPDATE ──────────────────────────────────────────────────────────────
export async function updateClassAction(
  classId: string,
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = classUpdateSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisá los campos marcados.",
      fieldErrors: flattenZod(parsed.error),
    };
  }

  await prisma.class.update({
    where: { id: classId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      categoryId: parsed.data.categoryId,
      level: parsed.data.level,
      durationSeconds: parsed.data.durationSeconds,
      equipment: parsed.data.equipment,
    },
  });

  revalidatePath("/admin/clases");
  revalidatePath(`/admin/clases/${classId}`);
  return { ok: true, message: "Cambios guardados.", classId };
}

// ─── PUBLISH / UNPUBLISH ─────────────────────────────────────────────────
export async function publishClassAction(classId: string) {
  await requireAdmin();
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { bunnyVideoId: true, status: true },
  });
  if (!cls) throw new Error("Class not found");
  if (!cls.bunnyVideoId && isBunnyConfigured()) {
    throw new Error("Subí el video antes de publicar.");
  }
  await prisma.class.update({
    where: { id: classId },
    data: { status: "published", publishedAt: new Date() },
  });
  revalidatePath("/admin/clases");
  revalidatePath(`/admin/clases/${classId}`);
}

export async function unpublishClassAction(classId: string) {
  await requireAdmin();
  await prisma.class.update({
    where: { id: classId },
    data: { status: "draft" },
  });
  revalidatePath("/admin/clases");
  revalidatePath(`/admin/clases/${classId}`);
}

// ─── ARCHIVE / DELETE ────────────────────────────────────────────────────
export async function archiveClassAction(classId: string) {
  await requireAdmin();
  await prisma.class.update({
    where: { id: classId },
    data: { status: "archived" },
  });
  revalidatePath("/admin/clases");
}

export async function deleteClassAction(classId: string) {
  await requireAdmin();
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { bunnyVideoId: true },
  });
  if (cls?.bunnyVideoId) {
    await deleteVideo(cls.bunnyVideoId);
  }
  await prisma.class.delete({ where: { id: classId } });
  revalidatePath("/admin/clases");
  redirect("/admin/clases");
}
