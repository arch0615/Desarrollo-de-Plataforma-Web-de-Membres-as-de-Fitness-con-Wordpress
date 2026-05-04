import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const PASSWORD = "abc123@123";
const EMAILS = ["admin@milagros.local", "test-member@milagros.local"];

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 12);
  for (const email of EMAILS) {
    const u = await prisma.user.update({
      where: { email },
      data: { passwordHash: hash },
      select: { email: true, role: true },
    });
    console.log(`updated: ${u.email} (${u.role})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
