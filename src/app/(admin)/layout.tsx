import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/app");

  return (
    <div className="min-h-svh flex">
      <aside className="hidden md:flex md:w-60 flex-col border-r p-4 gap-1">
        <Link href="/admin" className="font-semibold mb-4">
          Admin · Milagros
        </Link>
        {[
          ["/admin", "Dashboard"],
          ["/admin/clases", "Clases"],
          ["/admin/categorias", "Categorías"],
          ["/admin/miembros", "Miembros"],
          ["/admin/suscripciones", "Suscripciones"],
          ["/admin/pagos", "Pagos"],
          ["/admin/planes", "Planes"],
          ["/admin/configuracion", "Configuración"],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {label}
          </Link>
        ))}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
          className="mt-auto"
        >
          <Button variant="outline" size="sm" type="submit" className="w-full">
            Salir
          </Button>
        </form>
      </aside>
      <main className="flex-1">
        <header className="md:hidden border-b sticky top-0 bg-background z-30">
          <div className="flex h-14 items-center justify-between px-4 gap-2">
            <div className="flex items-center gap-2">
              <AdminMobileNav />
              <Link href="/admin" className="font-semibold">
                Admin
              </Link>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                Salir
              </Button>
            </form>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
