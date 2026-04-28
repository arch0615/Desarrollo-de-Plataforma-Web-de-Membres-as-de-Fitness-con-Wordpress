import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const rows = await prisma.playlist.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      _count: { select: { items: true } },
    },
  });
  return NextResponse.json({
    playlists: rows.map((r) => ({
      id: r.id,
      name: r.name,
      itemCount: r._count.items,
    })),
  });
}
