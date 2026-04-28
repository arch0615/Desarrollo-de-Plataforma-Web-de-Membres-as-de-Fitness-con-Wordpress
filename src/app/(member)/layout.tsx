import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-svh flex flex-col">
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur z-30">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/app" className="font-semibold">
            Milagros Fitness
          </Link>
          <nav className="flex items-center gap-1 sm:gap-3 text-sm">
            <Link href="/app" className="text-muted-foreground hover:text-foreground">
              Inicio
            </Link>
            <Link
              href="/app/clases"
              className="text-muted-foreground hover:text-foreground"
            >
              Clases
            </Link>
            <Link
              href="/app/favoritos"
              className="text-muted-foreground hover:text-foreground hidden sm:inline"
            >
              Favoritos
            </Link>
            <Link
              href="/app/listas"
              className="text-muted-foreground hover:text-foreground hidden sm:inline"
            >
              Listas
            </Link>
            <Link
              href="/app/perfil"
              className="text-muted-foreground hover:text-foreground"
            >
              Perfil
            </Link>
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
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
