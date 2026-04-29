import { prisma } from "@/lib/prisma";
import { CategoriesEditor } from "./categories-editor";

export const metadata = { title: "Categorías" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { classes: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Categorías</h1>
      <p className="mt-1 text-muted-foreground">
        Organizá la biblioteca por temáticas. Las categorías con clases
        asignadas no se pueden eliminar.
      </p>
      <CategoriesEditor
        items={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          sortOrder: c.sortOrder,
          classCount: c._count.classes,
        }))}
      />
    </div>
  );
}
