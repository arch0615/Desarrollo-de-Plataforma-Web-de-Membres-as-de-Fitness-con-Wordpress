import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { verifyEmailAction } from "@/lib/actions/auth";

export const metadata = { title: "Verificación de email" };

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await verifyEmailAction(token);

  if (result.ok) {
    return (
      <div className="rounded-xl border bg-accent/40 p-8 text-center space-y-3">
        <h1 className="text-2xl font-semibold">¡Email verificado!</h1>
        <p className="text-muted-foreground">
          Tu cuenta está lista. Ya podés iniciar sesión.
        </p>
        <Link href="/login" className={buttonVariants({ className: "mt-2" })}>
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const reason =
    result.reason === "expired"
      ? "El link expiró. Pedí uno nuevo desde la pantalla de inicio de sesión."
      : "El link es inválido o ya fue usado.";

  return (
    <div className="rounded-xl border p-8 text-center space-y-3">
      <h1 className="text-2xl font-semibold">No pudimos verificar</h1>
      <p className="text-muted-foreground">{reason}</p>
      <Link href="/login" className={buttonVariants({ variant: "outline" })}>
        Volver al inicio de sesión
      </Link>
    </div>
  );
}
