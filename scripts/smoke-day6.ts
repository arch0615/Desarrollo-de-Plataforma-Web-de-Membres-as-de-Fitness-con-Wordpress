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

  const classes = await prisma.class.findMany({
    where: { status: "published" },
    take: 3,
  });
  if (classes.length < 3) {
    console.error("need 3 published classes");
    process.exit(1);
  }

  // Create a playlist + add 3 items
  let pl = await prisma.playlist.findFirst({
    where: { userId: member.id, name: "Mañanas activas" },
  });
  if (!pl) {
    pl = await prisma.playlist.create({
      data: { userId: member.id, name: "Mañanas activas" },
    });
  }
  // Wipe items + re-add
  await prisma.playlistItem.deleteMany({ where: { playlistId: pl.id } });
  for (let i = 0; i < classes.length; i++) {
    await prisma.playlistItem.create({
      data: {
        playlistId: pl.id,
        classId: classes[i].id,
        sortOrder: i,
      },
    });
  }

  const detail = await prisma.playlist.findFirst({
    where: { id: pl.id },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: { class: { select: { title: true, durationSeconds: true } } },
      },
    },
  });
  console.log("playlist:", detail?.name);
  for (const it of detail?.items ?? []) {
    console.log(`  ${it.sortOrder + 1}. ${it.class.title} (${it.class.durationSeconds}s)`);
  }

  // Verify favorites query
  const favs = await prisma.favorite.findMany({
    where: { userId: member.id },
    include: { class: { select: { title: true, status: true } } },
  });
  console.log(
    "favorites:",
    favs.filter((f) => f.class.status === "published").map((f) => f.class.title),
  );

  // Verify subscription query (none — current state)
  const sub = await prisma.subscription.findFirst({
    where: { userId: member.id },
    include: { plan: true },
  });
  console.log("subscription:", sub ? sub.plan.name + " / " + sub.status : "none");

  await prisma.$disconnect();
})();
