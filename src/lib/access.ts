import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Returns the active subscription if the current user can access gated
// member content, else redirects to /membresia. Use at the top of any page
// that requires a paid subscription. Profile + Subscription pages are NOT
// gated — members must be able to manage their account regardless of state.

export async function requireActiveAccess() {
  const session = await auth();
  if (!session) redirect("/login");

  const sub = await prisma.subscription.findFirst({
    where: { userId: session.user.id, status: "active" },
    orderBy: { currentPeriodEnd: "desc" },
  });

  const now = new Date();
  const ok = !!sub && (!sub.currentPeriodEnd || sub.currentPeriodEnd > now);
  if (!ok) redirect("/membresia?reason=no-sub");

  return { session, subscription: sub! };
}
