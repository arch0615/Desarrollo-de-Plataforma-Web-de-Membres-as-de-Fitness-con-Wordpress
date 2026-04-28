import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";

export const metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { name: true, email: true, createdAt: true },
  });

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10 max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
        Perfil
      </h1>
      <p className="mt-1 text-muted-foreground">
        Tu información personal y seguridad de cuenta.
      </p>

      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">Información</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Email: <span className="text-foreground">{user?.email}</span> · miembro
          desde{" "}
          {user?.createdAt.toLocaleDateString("es-AR", {
            month: "long",
            year: "numeric",
          })}
        </p>
        <ProfileForm initialName={user?.name ?? ""} />
      </section>

      <section className="mt-6 rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Necesitás conocer tu contraseña actual.
        </p>
        <PasswordForm />
      </section>
    </div>
  );
}
