import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

(async () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const member = await prisma.user.findUnique({
    where: { email: "test-member@milagros.local" },
  });
  if (!member) {
    console.error("seed test-member first via smoke-day5");
    process.exit(1);
  }

  // Wipe any prior subs for a clean slate.
  await prisma.subscription.deleteMany({ where: { userId: member.id } });

  const plan = await prisma.plan.findUnique({ where: { slug: "mensual" } });
  if (!plan) {
    console.error("plans not seeded");
    process.exit(1);
  }

  // Simulate startCheckoutAction creating a pending sub
  const pending = await prisma.subscription.create({
    data: { userId: member.id, planId: plan.id, status: "pending" },
  });
  console.log("pending sub:", pending.id, "status:", pending.status);

  // Simulate webhook: preapproval becomes 'authorized' → activate
  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  await prisma.subscription.update({
    where: { id: pending.id },
    data: {
      status: "active",
      mpPreapprovalId: "fake-mp-id-1",
      currentPeriodStart: start,
      currentPeriodEnd: end,
    },
  });
  const activated = await prisma.subscription.findUnique({
    where: { id: pending.id },
  });
  console.log(
    "activated:",
    activated?.status,
    "until",
    activated?.currentPeriodEnd?.toLocaleDateString("es-AR"),
  );

  // Access check: status='active' AND currentPeriodEnd > now
  const access = await prisma.subscription.findFirst({
    where: { userId: member.id, status: "active" },
    orderBy: { currentPeriodEnd: "desc" },
  });
  const hasAccess =
    !!access && (!access.currentPeriodEnd || access.currentPeriodEnd > new Date());
  console.log("has access:", hasAccess);

  // Cancel: cancelAtPeriodEnd=true, status remains 'active' until period end
  await prisma.subscription.update({
    where: { id: pending.id },
    data: { cancelAtPeriodEnd: true, cancelledAt: new Date() },
  });
  const afterCancel = await prisma.subscription.findUnique({
    where: { id: pending.id },
  });
  const stillActive =
    afterCancel?.status === "active" &&
    !!afterCancel.currentPeriodEnd &&
    afterCancel.currentPeriodEnd > new Date();
  console.log(
    "after cancel: status=",
    afterCancel?.status,
    " cancelAtPeriodEnd=",
    afterCancel?.cancelAtPeriodEnd,
    " stillHasAccess=",
    stillActive,
  );

  // Now simulate period expiry: bump currentPeriodEnd to past, mark expired
  await prisma.subscription.update({
    where: { id: pending.id },
    data: {
      status: "expired",
      currentPeriodEnd: new Date(Date.now() - 86400_000),
    },
  });
  const finalAccess = await prisma.subscription.findFirst({
    where: { userId: member.id, status: "active" },
  });
  console.log("after expiry: hasAccess=", !!finalAccess);

  // Restore: grant manual sub for follow-on browser testing
  const restoredEnd = new Date();
  restoredEnd.setMonth(restoredEnd.getMonth() + 1);
  await prisma.subscription.update({
    where: { id: pending.id },
    data: {
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: restoredEnd,
      cancelAtPeriodEnd: false,
      cancelledAt: null,
    },
  });
  console.log(
    "restored for browser testing — test-member has access until",
    restoredEnd.toLocaleDateString("es-AR"),
  );

  await prisma.$disconnect();
})();
