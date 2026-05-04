import { User as UserIcon, Lock, Mail, Calendar } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";

export const metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { name: true, email: true, createdAt: true },
  });

  const initial = (user?.name ?? user?.email ?? "?").trim().charAt(0).toUpperCase();
  const memberSince = user?.createdAt.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10 max-w-2xl">
      <header>
        <Badge
          variant="secondary"
          className="bg-brand-coral/10 text-brand-coral border-0"
        >
          <UserIcon className="size-3.5" />
          Perfil
        </Badge>
        <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
          Tu <span className="text-gradient-sunset">cuenta</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Información personal y seguridad.
        </p>
      </header>

      {/* Identity card */}
      <section className="mt-8 relative isolate rounded-3xl overflow-hidden bg-plum-hero texture-grain p-7">
        <div className="absolute -top-10 -right-10 size-40 rounded-full bg-brand-coral/30 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="size-16 rounded-2xl bg-sunset grid place-items-center text-white text-2xl font-bold shadow-lg shadow-brand-coral/40 shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xl font-bold truncate">
              {user?.name ?? "Sin nombre"}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/80">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5" />
                {user?.email}
              </span>
              {memberSince && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  Miembro desde {memberSince}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-7">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-brand-coral/10 grid place-items-center">
            <UserIcon className="size-4 text-brand-coral" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Información</h2>
            <p className="text-sm text-muted-foreground">
              Actualizá tu nombre.
            </p>
          </div>
        </div>
        <ProfileForm initialName={user?.name ?? ""} />
      </section>

      <section className="mt-5 rounded-2xl border bg-card p-7">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-brand-amber/15 grid place-items-center">
            <Lock className="size-4 text-brand-amber" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Cambiar contraseña</h2>
            <p className="text-sm text-muted-foreground">
              Necesitás conocer tu contraseña actual.
            </p>
          </div>
        </div>
        <PasswordForm />
      </section>
    </div>
  );
}
