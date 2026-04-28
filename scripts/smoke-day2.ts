import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

(async () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  const u = await prisma.user.findUnique({
    where: { email: "admin@milagros.local" },
  });
  console.log("admin found:", !!u, "role:", u?.role, "verified:", !!u?.emailVerifiedAt);
  console.log("pw admin1234 match:", u ? await bcrypt.compare("admin1234", u.passwordHash) : "n/a");
  console.log("pw wrong match:", u ? await bcrypt.compare("wrong", u.passwordHash) : "n/a");
  console.log(
    "plans:",
    await prisma.plan.count(),
    "categories:",
    await prisma.category.count(),
    "classes:",
    await prisma.class.count(),
  );
  await prisma.$disconnect();
})();
