import Link from "next/link";
import { Sparkles } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { Button, buttonVariants } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-border/50 bg-background/70 backdrop-blur-md sticky top-0 z-30">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="size-8 rounded-xl bg-sunset grid place-items-center shadow-md shadow-brand-coral/30 group-hover:shadow-brand-coral/50 group-hover:scale-105 transition-all">
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="font-bold tracking-tight text-lg">
            Milagros <span className="text-gradient-sunset">Fitness</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/membresia"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline px-3 py-2"
          >
            Membresía
          </Link>
          {!session ? (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className={`${buttonVariants({ size: "sm" })} bg-sunset border-0 text-white shadow-md shadow-brand-coral/25 hover:opacity-95 hover:shadow-brand-coral/40 transition-all`}
              >
                Registrarme
              </Link>
            </>
          ) : (
            <>
              <Link
                href={session.user.role === "admin" ? "/admin" : "/app"}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Mi cuenta
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
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
