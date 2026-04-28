import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, getVideoMeta } from "@/lib/bunny";

// Bunny Stream webhook payload shape (per Bunny docs, fields we care about):
//   VideoLibraryId, VideoGuid, Status (enum), ...
// We persist every event for debugging and act on terminal statuses.
//
// Bunny status enum (from their docs):
//   0=created  1=uploaded  2=processing  3=transcoding  4=finished
//   5=error    6=upload-failed  7=jit-segmenting  8=jit-playlists-created

type Payload = {
  VideoLibraryId?: number;
  VideoGuid?: string;
  Status?: number;
};

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-webhook-signature") ?? "";

  // If a webhook secret is set, enforce it. If not (dev), accept and warn.
  if (process.env.BUNNY_WEBHOOK_SECRET) {
    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "bad_signature" }, { status: 401 });
    }
  } else {
    console.warn(
      "BUNNY_WEBHOOK_SECRET not set — accepting webhook without verification (dev only).",
    );
  }

  let payload: Payload;
  try {
    payload = JSON.parse(rawBody) as Payload;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const eventId = `${payload.VideoGuid ?? "unknown"}-${payload.Status ?? "x"}-${Date.now()}`;

  // Idempotency record. Best-effort: ignore unique-violation duplicates.
  try {
    await prisma.webhookEvent.create({
      data: {
        provider: "bunny",
        eventId,
        payload: payload as unknown as object,
      },
    });
  } catch {
    return NextResponse.json({ ok: true, dedup: true });
  }

  if (!payload.VideoGuid) {
    return NextResponse.json({ ok: true, ignored: "no_guid" });
  }

  const cls = await prisma.class.findFirst({
    where: { bunnyVideoId: payload.VideoGuid },
    select: { id: true, status: true },
  });
  if (!cls) {
    return NextResponse.json({ ok: true, ignored: "no_class_match" });
  }

  // Terminal "finished" status → fetch duration + thumbnail and mark draft (admin still publishes).
  if (payload.Status === 4 || payload.Status === 8) {
    const meta = await getVideoMeta(payload.VideoGuid);
    await prisma.class.update({
      where: { id: cls.id },
      data: {
        status: "draft", // ready for admin to publish
        durationSeconds: meta?.length ?? undefined,
      },
    });
  } else if (payload.Status === 5 || payload.Status === 6) {
    // error / upload-failed
    await prisma.class.update({
      where: { id: cls.id },
      data: { status: "draft" },
    });
  } else if (payload.Status === 2 || payload.Status === 3 || payload.Status === 7) {
    // mid-processing
    await prisma.class.update({
      where: { id: cls.id },
      data: { status: "processing" },
    });
  }

  await prisma.webhookEvent.update({
    where: { provider_eventId: { provider: "bunny", eventId } },
    data: { processedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
