import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const TARGETS = [
  { email: "admin@milagros.local", password: "admin1234" },
  { email: "test-member@milagros.local", password: "test1234" },
];

(async () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  for (const t of TARGETS) {
    const hash = await bcrypt.hash(t.password, 12);
    const r = await prisma.user.update({
      where: { email: t.email },
      data: {
        passwordHash: hash,
        emailVerifiedAt: new Date(),
      },
      select: { email: true, role: true },
    });
    const verify = await bcrypt.compare(t.password, hash);
    console.log(`✓ ${r.email} (${r.role}) password='${t.password}' bcrypt-roundtrip=${verify}`);
  }
  await prisma.$disconnect();
})();
