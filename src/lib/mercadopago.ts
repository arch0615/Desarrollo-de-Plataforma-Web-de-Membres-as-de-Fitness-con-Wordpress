import { createHmac, timingSafeEqual } from "node:crypto";

// Mercado Pago integration. Like the Bunny module, this is gated by
// `isMpConfigured()` so the rest of the app keeps working without credentials.

const MP_API = "https://api.mercadopago.com";

type Env = {
  accessToken: string;
  webhookSecret: string;
};

function readEnv(): Env | null {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  const webhookSecret = process.env.MP_WEBHOOK_SECRET;
  if (!accessToken) return null;
  return { accessToken, webhookSecret: webhookSecret ?? "" };
}

export function isMpConfigured() {
  return readEnv() !== null;
}

function requireEnv(): Env {
  const env = readEnv();
  if (!env) {
    throw new Error(
      "Mercado Pago not configured. Set MP_ACCESS_TOKEN (and MP_WEBHOOK_SECRET) in .env.",
    );
  }
  return env;
}

// ─── Preapproval (recurring subscription) ───────────────────────────────

export type Frequency = { type: "months"; value: number };

export type CreatePreapprovalArgs = {
  payerEmail: string;
  reason: string; // shown to user during checkout
  amountCents: number;
  currency: string; // e.g. ARS
  frequency: Frequency;
  externalReference: string; // our subscription.id
  backUrl: string;
};

type PreapprovalResponse = {
  id: string;
  init_point: string;
  status: string;
  next_payment_date?: string;
};

export async function createPreapproval(
  args: CreatePreapprovalArgs,
): Promise<PreapprovalResponse> {
  const env = requireEnv();
  const body = {
    reason: args.reason,
    auto_recurring: {
      frequency: args.frequency.value,
      frequency_type: args.frequency.type,
      transaction_amount: args.amountCents / 100,
      currency_id: args.currency,
    },
    payer_email: args.payerEmail,
    back_url: args.backUrl,
    external_reference: args.externalReference,
    status: "pending",
  };

  const res = await fetch(`${MP_API}/preapproval`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(
      `MP createPreapproval failed: ${res.status} ${await res.text()}`,
    );
  }
  return (await res.json()) as PreapprovalResponse;
}

export async function getPreapproval(id: string): Promise<{
  id: string;
  status: string;
  external_reference: string | null;
  next_payment_date: string | null;
  date_created: string | null;
}> {
  const env = requireEnv();
  const res = await fetch(`${MP_API}/preapproval/${id}`, {
    headers: { Authorization: `Bearer ${env.accessToken}` },
  });
  if (!res.ok) {
    throw new Error(
      `MP getPreapproval failed: ${res.status} ${await res.text()}`,
    );
  }
  return (await res.json()) as {
    id: string;
    status: string;
    external_reference: string | null;
    next_payment_date: string | null;
    date_created: string | null;
  };
}

export async function cancelPreapproval(id: string) {
  const env = requireEnv();
  const res = await fetch(`${MP_API}/preapproval/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${env.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "cancelled" }),
  });
  if (!res.ok) {
    throw new Error(
      `MP cancelPreapproval failed: ${res.status} ${await res.text()}`,
    );
  }
}

// ─── Authorized payments (one-time and renewal charges) ─────────────────

export async function getPayment(id: string) {
  const env = requireEnv();
  const res = await fetch(`${MP_API}/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${env.accessToken}` },
  });
  if (!res.ok) {
    throw new Error(
      `MP getPayment failed: ${res.status} ${await res.text()}`,
    );
  }
  return (await res.json()) as {
    id: number;
    status: string; // approved | rejected | cancelled | refunded | etc.
    transaction_amount: number;
    currency_id: string;
    external_reference: string | null;
    date_approved: string | null;
    metadata?: Record<string, unknown>;
  };
}

// ─── Webhook signature ──────────────────────────────────────────────────
//
// MP sends `x-signature` like `ts=1234567890,v1=hex` and `x-request-id`.
// The signed manifest is `id:<dataId>;request-id:<requestId>;ts:<ts>;`.
// See https://www.mercadopago.com.ar/developers/en/docs/your-integrations/notifications/webhooks

export function verifyMpSignature({
  rawSignature,
  requestId,
  dataId,
  secret,
}: {
  rawSignature: string;
  requestId: string;
  dataId: string;
  secret: string;
}) {
  if (!rawSignature || !secret || !dataId) return false;
  const parts = Object.fromEntries(
    rawSignature
      .split(",")
      .map((p) => p.trim().split("="))
      .filter((kv) => kv.length === 2)
      .map(([k, v]) => [k.trim(), v.trim()] as const),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1, "hex"));
  } catch {
    return false;
  }
}

// ─── Plan → MP frequency mapping ────────────────────────────────────────

export function mpFrequencyForInterval(
  interval: "month" | "quarter" | "year",
): Frequency {
  switch (interval) {
    case "month":
      return { type: "months", value: 1 };
    case "quarter":
      return { type: "months", value: 3 };
    case "year":
      return { type: "months", value: 12 };
  }
}

// ─── Period helper (used after MP confirms or for manual grants) ────────

export function periodEndForInterval(
  start: Date,
  interval: "month" | "quarter" | "year",
): Date {
  const d = new Date(start);
  const months =
    interval === "month" ? 1 : interval === "quarter" ? 3 : 12;
  d.setMonth(d.getMonth() + months);
  return d;
}
