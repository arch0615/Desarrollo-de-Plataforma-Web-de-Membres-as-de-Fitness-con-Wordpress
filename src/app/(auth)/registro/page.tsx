import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Crear cuenta" };

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect(session.user.role === "admin" ? "/admin" : "/app");

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Empezá a entrenar en menos de un minuto
        </p>
      </div>
      <RegisterForm />
      <div className="text-sm text-center text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-foreground underline">
          Iniciá sesión
        </Link>
      </div>
    </div>
  );
}
