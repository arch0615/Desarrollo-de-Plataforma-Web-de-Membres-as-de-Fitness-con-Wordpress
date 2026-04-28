import Link from "next/link";
import { ResetForm } from "./reset-form";

export const metadata = { title: "Nueva contraseña" };

export default async function ResetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Crear nueva contraseña
        </h1>
        <p className="text-sm text-muted-foreground">
          Elegí una contraseña segura.
        </p>
      </div>
      <ResetForm token={token} />
      <div className="text-sm text-center">
        <Link href="/login" className="text-muted-foreground underline">
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
