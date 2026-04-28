import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  classId: z.string().uuid(),
  positionSeconds: z.coerce.number().int().min(0).max(60 * 60 * 24),
  completed: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "bad_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { classId, positionSeconds, completed } = parsed.data;
  const userId = session.user.id;

  // Bound position to class duration if known.
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { id: true, durationSeconds: true, status: true },
  });
  if (!cls || cls.status !== "published") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const cappedPos =
    cls.durationSeconds > 0
      ? Math.min(positionSeconds, cls.durationSeconds)
      : positionSeconds;

  const isCompleted =
    completed === true ||
    (cls.durationSeconds > 0 && cappedPos >= cls.durationSeconds - 5);

  await prisma.classView.upsert({
    where: { userId_classId: { userId, classId } },
    create: {
      userId,
      classId,
      lastPositionSeconds: cappedPos,
      lastViewedAt: new Date(),
      completedAt: isCompleted ? new Date() : null,
    },
    update: {
      lastPositionSeconds: cappedPos,
      lastViewedAt: new Date(),
      completedAt: isCompleted ? new Date() : undefined,
    },
  });

  return new NextResponse(null, { status: 204 });
}
