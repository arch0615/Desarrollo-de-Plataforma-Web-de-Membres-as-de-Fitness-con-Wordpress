import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Crear cuenta" };

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect(session.user.role === "admin" ? "/admin" : "/app");

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Crear <span className="text-gradient-sunset">cuenta</span>
        </h1>
        <p className="text-muted-foreground">
          Empezá a entrenar en menos de un minuto.
        </p>
      </div>
      <RegisterForm />
      <p className="text-sm text-center text-muted-foreground pt-2">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/login"
          className="text-brand-coral font-semibold hover:underline"
        >
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
