import { randomBytes } from "node:crypto";
import { prisma } from "./prisma";

export type TokenPurpose = "verify" | "reset";

const TTL_MS: Record<TokenPurpose, number> = {
  verify: 1000 * 60 * 60 * 24, // 24 h
  reset: 1000 * 60 * 60,       // 1 h
};

export async function createEmailToken(userId: string, purpose: TokenPurpose) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TTL_MS[purpose]);
  await prisma.emailToken.create({
    data: { userId, purpose, token, expiresAt },
  });
  return token;
}

export async function consumeEmailToken(token: string, purpose: TokenPurpose) {
  const row = await prisma.emailToken.findUnique({ where: { token } });
  if (!row) return { ok: false as const, reason: "invalid" as const };
  if (row.usedAt) return { ok: false as const, reason: "used" as const };
  if (row.purpose !== purpose) return { ok: false as const, reason: "invalid" as const };
  if (row.expiresAt < new Date()) return { ok: false as const, reason: "expired" as const };

  await prisma.emailToken.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });
  return { ok: true as const, userId: row.userId };
}
