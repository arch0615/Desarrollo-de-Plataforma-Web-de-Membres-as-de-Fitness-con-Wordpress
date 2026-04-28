import Link from "next/link";
import { ForgotForm } from "./forgot-form";

export const metadata = { title: "Recuperar contraseña" };

export default function ForgotPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Recuperar contraseña
        </h1>
        <p className="text-sm text-muted-foreground">
          Te enviamos un link para crear una nueva.
        </p>
      </div>
      <ForgotForm />
      <div className="text-sm text-center">
        <Link href="/login" className="text-muted-foreground underline">
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
