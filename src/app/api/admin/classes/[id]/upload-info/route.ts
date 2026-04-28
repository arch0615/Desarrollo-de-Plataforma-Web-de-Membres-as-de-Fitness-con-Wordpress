import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildTusUploadInfo,
  createVideo,
  isBunnyConfigured,
} from "@/lib/bunny";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isBunnyConfigured()) {
    return NextResponse.json(
      { error: "bunny_not_configured" },
      { status: 503 },
    );
  }

  const { id } = await context.params;

  const cls = await prisma.class.findUnique({
    where: { id },
    select: { id: true, title: true, bunnyVideoId: true },
  });
  if (!cls) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let videoId = cls.bunnyVideoId;
  if (!videoId) {
    const created = await createVideo(cls.title);
    videoId = created.videoId;
    await prisma.class.update({
      where: { id: cls.id },
      data: { bunnyVideoId: videoId, status: "processing" },
    });
  }

  const info = buildTusUploadInfo(videoId);
  return NextResponse.json({
    endpoint: info.endpoint,
    headers: info.headers,
    videoId,
  });
}
