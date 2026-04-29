import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDuration } from "@/lib/format";
import { isBunnyConfigured } from "@/lib/bunny";

export const metadata = { title: "Clases" };

const statusLabel: Record<string, string> = {
  draft: "Borrador",
  processing: "Procesando",
  published: "Publicada",
  archived: "Archivada",
};

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  draft: "outline",
  processing: "secondary",
  published: "default",
  archived: "destructive",
};

export default async function AdminClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const status = sp.status ?? "";

  const classes = await prisma.class.findMany({
    where: {
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(status ? { status: status as "draft" | "processing" | "published" | "archived" } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const bunnyOk = isBunnyConfigured();

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Clases</h1>
          <p className="mt-1 text-muted-foreground">
            Subí, editá y publicá las clases de la biblioteca.
          </p>
        </div>
        <Link
          href="/admin/clases/nueva"
          className={buttonVariants()}
        >
          Nueva clase
        </Link>
      </div>

      {!bunnyOk && (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm">
          <p className="font-medium">Falta configurar Bunny Stream</p>
          <p className="mt-1 text-muted-foreground">
            Podés crear y editar metadatos de clase ahora, pero no vas a poder
            subir video hasta que se completen las variables{" "}
            <code className="text-xs">BUNNY_STREAM_*</code> en{" "}
            <code className="text-xs">.env</code>.
          </p>
        </div>
      )}

      <form className="mt-6 flex flex-wrap gap-2" action="/admin/clases">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por título…"
          className="flex-1 min-w-[200px] rounded-lg border bg-background px-3 py-2 text-sm"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="published">Publicada</option>
          <option value="archived">Archivada</option>
        </select>
        <button
          type="submit"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Filtrar
        </button>
      </form>

      <div className="mt-6 rounded-2xl border overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Título</th>
              <th className="text-left px-4 py-2 font-medium">Categoría</th>
              <th className="text-left px-4 py-2 font-medium">Duración</th>
              <th className="text-left px-4 py-2 font-medium">Estado</th>
              <th className="text-right px-4 py-2 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted-foreground py-8">
                  No hay clases todavía.
                </td>
              </tr>
            )}
            {classes.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/clases/${c.id}`} className="hover:underline">
                    {c.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{c.slug}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.category.name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDuration(c.durationSeconds)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[c.status] ?? "outline"}>
                    {statusLabel[c.status] ?? c.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/clases/${c.id}`}
                    className="text-sm underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
