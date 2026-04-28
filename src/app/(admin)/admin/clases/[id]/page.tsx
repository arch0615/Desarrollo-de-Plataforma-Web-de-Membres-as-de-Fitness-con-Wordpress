import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { isBunnyConfigured } from "@/lib/bunny";
import { ClassEditor } from "./class-editor";
import { VideoUploadCard } from "./video-upload-card";
import { PublishControls } from "./publish-controls";

export const metadata = { title: "Editar clase" };

const statusLabel: Record<string, string> = {
  draft: "Borrador",
  processing: "Procesando",
  published: "Publicada",
  archived: "Archivada",
};

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [cls, categories] = await Promise.all([
    prisma.class.findUnique({
      where: { id },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!cls) notFound();

  const bunnyOk = isBunnyConfigured();

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <Link
        href="/admin/clases"
        className="text-sm text-muted-foreground underline"
      >
        ← Clases
      </Link>
      <div className="mt-2 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{cls.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {cls.slug} · creada {cls.createdAt.toLocaleDateString("es-AR")}
          </p>
        </div>
        <Badge variant="outline">{statusLabel[cls.status] ?? cls.status}</Badge>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <ClassEditor
            cls={{
              id: cls.id,
              title: cls.title,
              description: cls.description,
              categoryId: cls.categoryId,
              level: cls.level,
              durationSeconds: cls.durationSeconds,
              equipment: cls.equipment,
            }}
            categories={categories}
          />
        </div>
        <div className="space-y-6">
          <VideoUploadCard
            classId={cls.id}
            bunnyVideoId={cls.bunnyVideoId}
            bunnyConfigured={bunnyOk}
          />
          <PublishControls
            classId={cls.id}
            status={cls.status}
            hasVideo={!!cls.bunnyVideoId}
            bunnyConfigured={bunnyOk}
          />
        </div>
      </div>
    </div>
  );
}
