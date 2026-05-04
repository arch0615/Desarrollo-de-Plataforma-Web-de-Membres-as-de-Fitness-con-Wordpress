import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
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
      <header className="border-b border-border/50 bg-background/70 backdrop-blur-md sticky top-0 z-30">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
          <Link
            href="/app"
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className="size-8 rounded-xl bg-sunset grid place-items-center shadow-md shadow-brand-coral/30 group-hover:scale-105 transition-transform">
              <Sparkles className="size-4 text-white" />
            </div>
            <span className="font-bold tracking-tight text-base sm:text-lg">
              Milagros <span className="text-gradient-sunset">Fitness</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/app"
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors font-medium"
            >
              Inicio
            </Link>
            <Link
              href="/app/clases"
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors font-medium"
            >
              Clases
            </Link>
            <Link
              href="/app/favoritos"
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors font-medium hidden sm:inline"
            >
              Favoritos
            </Link>
            <Link
              href="/app/listas"
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors font-medium hidden sm:inline"
            >
              Listas
            </Link>
            <Link
              href="/app/perfil"
              className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors font-medium"
            >
              Perfil
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
              className="ml-1"
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
