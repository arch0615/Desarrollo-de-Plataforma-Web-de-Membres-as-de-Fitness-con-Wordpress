import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

(async () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const email = "test-member@milagros.local";
  const passwordHash = await bcrypt.hash("test1234", 12);
  const member = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Test Member",
      passwordHash,
      role: "member",
      emailVerifiedAt: new Date(),
    },
  });
  console.log("member:", member.email);

  // Pick two classes to simulate progress + favorites.
  const classes = await prisma.class.findMany({
    where: { status: "published" },
    take: 2,
  });
  if (classes.length < 2) {
    console.error("need >=2 published classes");
    process.exit(1);
  }
  const [a, b] = classes;

  // Simulate "continue watching" on class A: 30% in
  const aPos = Math.round(a.durationSeconds * 0.3);
  await prisma.classView.upsert({
    where: { userId_classId: { userId: member.id, classId: a.id } },
    create: {
      userId: member.id,
      classId: a.id,
      lastPositionSeconds: aPos,
      lastViewedAt: new Date(),
    },
    update: { lastPositionSeconds: aPos, lastViewedAt: new Date() },
  });

  // Favorite class B
  await prisma.favorite.upsert({
    where: { userId_classId: { userId: member.id, classId: b.id } },
    create: { userId: member.id, classId: b.id },
    update: {},
  });

  // Now query the dashboard the same way page.tsx does.
  const inProgress = await prisma.classView.findMany({
    where: {
      userId: member.id,
      lastPositionSeconds: { gt: 5 },
      completedAt: null,
      class: { status: "published" },
    },
    include: { class: { include: { category: true } } },
  });
  console.log(
    "continue-watching:",
    inProgress.map((v) => ({
      title: v.class.title,
      pct: Math.round((v.lastPositionSeconds / v.class.durationSeconds) * 100) + "%",
    })),
  );

  const favs = await prisma.favorite.findMany({
    where: { userId: member.id },
    include: { class: { select: { title: true } } },
  });
  console.log(
    "favorites:",
    favs.map((f) => f.class.title),
  );

  // Library search test
  const search = await prisma.class.findMany({
    where: {
      status: "published",
      OR: [
        { title: { contains: "movilidad", mode: "insensitive" } },
        { description: { contains: "movilidad", mode: "insensitive" } },
      ],
    },
    select: { title: true },
  });
  console.log("search 'movilidad':", search.map((c) => c.title));

  await prisma.$disconnect();
})();
