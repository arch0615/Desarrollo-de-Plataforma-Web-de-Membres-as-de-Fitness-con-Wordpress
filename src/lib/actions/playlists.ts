"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUser() {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

async function ownsPlaylist(userId: string, playlistId: string) {
  const p = await prisma.playlist.findFirst({
    where: { id: playlistId, userId },
    select: { id: true },
  });
  return !!p;
}

const nameSchema = z
  .string()
  .min(2, "Nombre muy corto")
  .max(60, "Nombre muy largo");

// ─── CREATE ──────────────────────────────────────────────────────────────
export async function createPlaylistAction(name: string, description?: string) {
  const userId = await requireUser();
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0].message };
  }
  const created = await prisma.playlist.create({
    data: {
      userId,
      name: parsed.data,
      description: description?.slice(0, 280),
    },
    select: { id: true },
  });
  revalidatePath("/app/listas");
  return { ok: true as const, id: created.id };
}

// ─── RENAME ──────────────────────────────────────────────────────────────
export async function renamePlaylistAction(
  playlistId: string,
  name: string,
  description?: string,
) {
  const userId = await requireUser();
  if (!(await ownsPlaylist(userId, playlistId))) {
    return { ok: false as const, message: "No encontrada" };
  }
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0].message };
  }
  await prisma.playlist.update({
    where: { id: playlistId },
    data: {
      name: parsed.data,
      description: description?.slice(0, 280) ?? null,
    },
  });
  revalidatePath("/app/listas");
  revalidatePath(`/app/listas/${playlistId}`);
  return { ok: true as const };
}

// ─── DELETE ──────────────────────────────────────────────────────────────
export async function deletePlaylistAction(playlistId: string) {
  const userId = await requireUser();
  if (!(await ownsPlaylist(userId, playlistId))) {
    return { ok: false as const, message: "No encontrada" };
  }
  await prisma.playlist.delete({ where: { id: playlistId } });
  revalidatePath("/app/listas");
  return { ok: true as const };
}

// ─── ADD CLASS ───────────────────────────────────────────────────────────
export async function addClassToPlaylistAction(
  playlistId: string,
  classId: string,
) {
  const userId = await requireUser();
  if (!(await ownsPlaylist(userId, playlistId))) {
    return { ok: false as const, message: "Lista no encontrada" };
  }
  // Append at the end.
  const last = await prisma.playlistItem.findFirst({
    where: { playlistId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const nextOrder = (last?.sortOrder ?? -1) + 1;
  try {
    await prisma.playlistItem.create({
      data: { playlistId, classId, sortOrder: nextOrder },
    });
  } catch {
    return { ok: false as const, message: "La clase ya está en esta lista" };
  }
  revalidatePath("/app/listas");
  revalidatePath(`/app/listas/${playlistId}`);
  return { ok: true as const };
}

// ─── REMOVE CLASS ────────────────────────────────────────────────────────
export async function removeClassFromPlaylistAction(
  playlistId: string,
  classId: string,
) {
  const userId = await requireUser();
  if (!(await ownsPlaylist(userId, playlistId))) {
    return { ok: false as const, message: "Lista no encontrada" };
  }
  await prisma.playlistItem.delete({
    where: { playlistId_classId: { playlistId, classId } },
  });
  revalidatePath(`/app/listas/${playlistId}`);
  return { ok: true as const };
}

// ─── REORDER (move up / down) ────────────────────────────────────────────
export async function moveClassInPlaylistAction(
  playlistId: string,
  classId: string,
  direction: "up" | "down",
) {
  const userId = await requireUser();
  if (!(await ownsPlaylist(userId, playlistId))) {
    return { ok: false as const, message: "Lista no encontrada" };
  }
  const items = await prisma.playlistItem.findMany({
    where: { playlistId },
    orderBy: { sortOrder: "asc" },
    select: { classId: true, sortOrder: true },
  });
  const idx = items.findIndex((i) => i.classId === classId);
  if (idx === -1) return { ok: false as const, message: "Item no encontrado" };

  const swapWith =
    direction === "up" && idx > 0
      ? items[idx - 1]
      : direction === "down" && idx < items.length - 1
        ? items[idx + 1]
        : null;
  if (!swapWith) return { ok: true as const };

  const me = items[idx];
  await prisma.$transaction([
    prisma.playlistItem.update({
      where: { playlistId_classId: { playlistId, classId: me.classId } },
      data: { sortOrder: swapWith.sortOrder },
    }),
    prisma.playlistItem.update({
      where: { playlistId_classId: { playlistId, classId: swapWith.classId } },
      data: { sortOrder: me.sortOrder },
    }),
  ]);
  revalidatePath(`/app/listas/${playlistId}`);
  return { ok: true as const };
}
