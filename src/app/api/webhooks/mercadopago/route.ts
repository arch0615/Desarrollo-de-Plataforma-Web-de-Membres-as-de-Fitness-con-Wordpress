import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getPayment,
  getPreapproval,
  isMpConfigured,
  periodEndForInterval,
  verifyMpSignature,
} from "@/lib/mercadopago";

// Mercado Pago webhook handler.
//
// Two relevant topics:
//   - `preapproval`         : recurring subscription state changes
//   - `authorized_payment`  : a charge happened for a recurring subscription
//   - `payment`             : one-shot or renewal payment
//
// MP delivers `?type=...&data.id=...` query string and JSON body
// `{ action, type, data: { id }, ... }`. We verify the v1 signature, persist
// the event for idempotency, then fetch the authoritative resource and
// reconcile our subscription state.

type Payload = {
  action?: string;
  type?: string;
  data?: { id?: string };
};

function statusFromMpPreapproval(mpStatus: string):
  | "pending"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired" {
  switch (mpStatus) {
    case "authorized":
      return "active";
    case "paused":
      return "past_due";
    case "cancelled":
      return "cancelled";
    case "finished":
      return "expired";
    default:
      return "pending";
  }
}

export async function POST(req: Request) {
  if (!isMpConfigured()) {
    // No credentials → can't authenticate or reconcile. ACK so MP stops
    // retrying; ops should configure MP_ACCESS_TOKEN before going live.
    return NextResponse.json({ ok: true, skipped: "mp_not_configured" });
  }
  const rawBody = await req.text();
  const url = new URL(req.url);
  const queryDataId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const queryType = url.searchParams.get("type") ?? url.searchParams.get("topic");
  const xSignature = req.headers.get("x-signature") ?? "";
  const xRequestId = req.headers.get("x-request-id") ?? "";

  let payload: Payload = {};
  try {
    if (rawBody) payload = JSON.parse(rawBody) as Payload;
  } catch {
    /* MP sometimes sends bare query-string */
  }

  const dataId = payload.data?.id ?? queryDataId ?? "";
  const eventType = payload.type ?? queryType ?? "unknown";

  // Signature verification — required when secret is set, warn otherwise.
  if (process.env.MP_WEBHOOK_SECRET) {
    const ok = verifyMpSignature({
      rawSignature: xSignature,
      requestId: xRequestId,
      dataId,
      secret: process.env.MP_WEBHOOK_SECRET,
    });
    if (!ok) {
      return NextResponse.json({ error: "bad_signature" }, { status: 401 });
    }
  } else {
    console.warn(
      "MP_WEBHOOK_SECRET not set — accepting webhook without verification (dev only).",
    );
  }

  const eventId = `${eventType}-${dataId}-${xRequestId || Date.now()}`;

  try {
    await prisma.webhookEvent.create({
      data: {
        provider: "mercadopago",
        eventId,
        payload: { ...payload, queryDataId, queryType, xSignature, xRequestId },
      },
    });
  } catch {
    // Duplicate (provider, eventId) → idempotent no-op.
    return NextResponse.json({ ok: true, dedup: true });
  }

  let result: { kind: string; details?: unknown } = { kind: "ignored" };

  try {
    if (eventType === "preapproval" && dataId) {
      result = await handlePreapproval(dataId);
    } else if (
      (eventType === "authorized_payment" || eventType === "payment") &&
      dataId
    ) {
      result = await handlePayment(dataId);
    }
    await prisma.webhookEvent.update({
      where: { provider_eventId: { provider: "mercadopago", eventId } },
      data: { processedAt: new Date() },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    await prisma.webhookEvent.update({
      where: { provider_eventId: { provider: "mercadopago", eventId } },
      data: { error: msg },
    });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...result });
}

async function handlePreapproval(preapprovalId: string) {
  const fresh = await getPreapproval(preapprovalId);
  const externalRef = fresh.external_reference;
  if (!externalRef) return { kind: "ignored", details: "no_external_ref" };

  const sub = await prisma.subscription.findUnique({
    where: { id: externalRef },
    include: { plan: true },
  });
  if (!sub) return { kind: "ignored", details: "no_local_sub" };

  const newStatus = statusFromMpPreapproval(fresh.status);

  // First-authorization sets the period start/end if not already set.
  let periodStart = sub.currentPeriodStart;
  let periodEnd = sub.currentPeriodEnd;
  if (newStatus === "active" && !periodStart) {
    periodStart = new Date();
    periodEnd = periodEndForInterval(periodStart, sub.plan.interval);
  }

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: newStatus,
      mpPreapprovalId: preapprovalId,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    },
  });

  return {
    kind: "preapproval",
    details: { id: preapprovalId, mpStatus: fresh.status, localStatus: newStatus },
  };
}

async function handlePayment(paymentId: string) {
  const fresh = await getPayment(paymentId);
  const externalRef = fresh.external_reference;

  // Locate the subscription via external_reference (we stamp it on preapproval).
  const sub = externalRef
    ? await prisma.subscription.findUnique({
        where: { id: externalRef },
        include: { plan: true },
      })
    : null;

  // Persist payment row regardless of sub linkage.
  const status: "approved" | "rejected" | "refunded" | "pending" =
    fresh.status === "approved"
      ? "approved"
      : fresh.status === "refunded"
        ? "refunded"
        : fresh.status === "rejected" || fresh.status === "cancelled"
          ? "rejected"
          : "pending";

  await prisma.payment.upsert({
    where: { mpPaymentId: String(fresh.id) },
    create: {
      userId: sub?.userId ?? "",
      subscriptionId: sub?.id ?? null,
      amountCents: Math.round(fresh.transaction_amount * 100),
      currency: fresh.currency_id,
      status,
      mpPaymentId: String(fresh.id),
      paidAt: fresh.date_approved ? new Date(fresh.date_approved) : null,
      rawEvent: fresh as unknown as object,
    },
    update: {
      status,
      paidAt: fresh.date_approved ? new Date(fresh.date_approved) : null,
      rawEvent: fresh as unknown as object,
    },
  });

  // Approved renewal: extend the period and ensure status=active.
  if (sub && status === "approved") {
    const start = new Date();
    const end = periodEndForInterval(start, sub.plan.interval);
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "active",
        currentPeriodStart: start,
        currentPeriodEnd: end,
      },
    });
  } else if (sub && status === "rejected") {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "past_due" },
    });
  }

  return { kind: "payment", details: { id: fresh.id, status } };
}
