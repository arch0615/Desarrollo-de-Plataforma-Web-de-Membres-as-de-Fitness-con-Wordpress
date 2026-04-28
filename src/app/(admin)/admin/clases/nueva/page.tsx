import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewClassForm } from "./new-class-form";

export const metadata = { title: "Nueva clase" };

export default async function NewClassPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="p-6 lg:p-10 max-w-2xl">
      <Link
        href="/admin/clases"
        className="text-sm text-muted-foreground underline"
      >
        ← Clases
      </Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Nueva clase
      </h1>
      <p className="mt-1 text-muted-foreground">
        Cargá los metadatos. Después subís el video y publicás.
      </p>
      <NewClassForm categories={categories} />
    </div>
  );
}
