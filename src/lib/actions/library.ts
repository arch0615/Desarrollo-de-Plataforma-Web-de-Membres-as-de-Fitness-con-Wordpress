"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUser() {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function toggleFavoriteAction(classId: string) {
  const session = await requireUser();
  const userId = session.user.id;

  const existing = await prisma.favorite.findUnique({
    where: { userId_classId: { userId, classId } },
    select: { userId: true },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { userId_classId: { userId, classId } },
    });
    revalidatePath("/app/favoritos");
    return { favorited: false };
  }
  await prisma.favorite.create({ data: { userId, classId } });
  revalidatePath("/app/favoritos");
  return { favorited: true };
}
