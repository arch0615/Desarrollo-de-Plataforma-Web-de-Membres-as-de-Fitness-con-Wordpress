import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect(session.user.role === "admin" ? "/admin" : "/app");

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola de nuevo
        </h1>
        <p className="text-sm text-muted-foreground">
          Iniciá sesión en tu cuenta
        </p>
      </div>
      <LoginForm />
      <div className="text-sm text-center text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="text-foreground underline">
          Registrate
        </Link>
      </div>
      <div className="text-sm text-center">
        <Link href="/recuperar" className="text-muted-foreground underline">
          Olvidé mi contraseña
        </Link>
      </div>
    </div>
  );
}
