import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding…");

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@milagros.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin1234";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Milagros (admin)",
      passwordHash,
      role: "admin",
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✓ admin: ${admin.email} (pw: ${adminPassword})`);

  const plans = [
    {
      slug: "mensual",
      name: "Mensual",
      interval: "month" as const,
      priceCents: 1500000,
      sortOrder: 1,
      features: ["Acceso ilimitado", "Nuevas clases cada semana", "Cancelá cuando quieras"],
    },
    {
      slug: "trimestral",
      name: "Trimestral",
      interval: "quarter" as const,
      priceCents: 3900000,
      sortOrder: 2,
      features: ["Todo lo del mensual", "Ahorrás 13%", "Acceso prioritario a novedades"],
    },
    {
      slug: "anual",
      name: "Anual",
      interval: "year" as const,
      priceCents: 14400000,
      sortOrder: 3,
      features: ["Todo lo del trimestral", "Ahorrás 20%", "1 sesión 1:1 al año"],
    },
  ];
  for (const p of plans) {
    await prisma.plan.upsert({
      where: { slug: p.slug },
      update: { ...p, features: p.features },
      create: { ...p, features: p.features, currency: "ARS" },
    });
  }
  console.log(`✓ plans: ${plans.length}`);

  const categories = [
    { slug: "flexibilidad", name: "Flexibilidad", sortOrder: 1 },
    { slug: "movilidad", name: "Movilidad", sortOrder: 2 },
    { slug: "fuerza", name: "Fuerza", sortOrder: 3 },
    { slug: "entrenamiento", name: "Entrenamiento", sortOrder: 4 },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }
  console.log(`✓ categories: ${categories.length}`);

  const allCategories = await prisma.category.findMany();
  const sampleClasses = [
    {
      slug: "estiramiento-matutino-15min",
      title: "Estiramiento matutino — 15 minutos",
      description: "Una rutina suave para arrancar el día con flexibilidad y energía.",
      categorySlug: "flexibilidad",
      level: "beginner" as const,
      durationSeconds: 900,
      equipment: ["mat"],
    },
    {
      slug: "movilidad-cadera-y-columna",
      title: "Movilidad de cadera y columna",
      description: "Mejorá tu rango de movimiento con ejercicios de movilidad articular.",
      categorySlug: "movilidad",
      level: "intermediate" as const,
      durationSeconds: 1500,
      equipment: ["mat", "bloque"],
    },
    {
      slug: "fuerza-tren-inferior-30min",
      title: "Fuerza — tren inferior — 30 minutos",
      description: "Entrenamiento de piernas y glúteos con peso corporal y mancuernas.",
      categorySlug: "fuerza",
      level: "intermediate" as const,
      durationSeconds: 1800,
      equipment: ["mat", "mancuernas"],
    },
    {
      slug: "hiit-funcional-20min",
      title: "HIIT funcional — 20 minutos",
      description: "Trabajo cardiovascular de alta intensidad con descansos cortos.",
      categorySlug: "entrenamiento",
      level: "advanced" as const,
      durationSeconds: 1200,
      equipment: [],
    },
    {
      slug: "core-y-postura-10min",
      title: "Core y postura — 10 minutos",
      description: "Activá el centro y mejorá la postura en menos de 15 minutos.",
      categorySlug: "fuerza",
      level: "beginner" as const,
      durationSeconds: 600,
      equipment: ["mat"],
    },
  ];
  for (const c of sampleClasses) {
    const cat = allCategories.find((x) => x.slug === c.categorySlug)!;
    await prisma.class.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        description: c.description,
        categoryId: cat.id,
        level: c.level,
        durationSeconds: c.durationSeconds,
        equipment: c.equipment,
        status: "published",
        publishedAt: new Date(),
      },
      create: {
        slug: c.slug,
        title: c.title,
        description: c.description,
        categoryId: cat.id,
        level: c.level,
        durationSeconds: c.durationSeconds,
        equipment: c.equipment,
        status: "published",
        publishedAt: new Date(),
      },
    });
  }
  console.log(`✓ classes: ${sampleClasses.length}`);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
