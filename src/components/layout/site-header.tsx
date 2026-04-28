import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button, buttonVariants } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-30">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Milagros Fitness
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/membresia"
            className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline"
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
              <Link href="/registro" className={buttonVariants({ size: "sm" })}>
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
