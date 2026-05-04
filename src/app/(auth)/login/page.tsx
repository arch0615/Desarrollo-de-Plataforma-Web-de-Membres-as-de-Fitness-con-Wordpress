import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect(session.user.role === "admin" ? "/admin" : "/app");

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Hola de <span className="text-gradient-sunset">nuevo</span>
        </h1>
        <p className="text-muted-foreground">
          Iniciá sesión y volvé a entrenar.
        </p>
      </div>
      <LoginForm />
      <div className="space-y-2 text-sm text-center pt-2">
        <p className="text-muted-foreground">
          ¿No tenés cuenta?{" "}
          <Link
            href="/registro"
            className="text-brand-coral font-semibold hover:underline"
          >
            Registrate
          </Link>
        </p>
        <Link
          href="/recuperar"
          className="text-muted-foreground hover:text-foreground transition-colors inline-block"
        >
          Olvidé mi contraseña
        </Link>
      </div>
    </div>
  );
}
