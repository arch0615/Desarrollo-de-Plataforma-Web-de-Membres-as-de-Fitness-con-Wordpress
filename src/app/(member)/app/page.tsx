import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">
        Hola, {session?.user.name?.split(" ")[0] ?? "atleta"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Tu biblioteca está casi lista. Las clases reales aparecen acá a partir
        de la próxima fase.
      </p>
    </div>
  );
}
