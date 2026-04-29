import { CheckCircle2, XCircle } from "lucide-react";
import { isBunnyConfigured } from "@/lib/bunny";
import { isMpConfigured } from "@/lib/mercadopago";
import { TestEmailButton } from "./test-email-button";

export const metadata = { title: "Configuración" };
export const dynamic = "force-dynamic";

function StatusRow({
  label,
  ok,
  hint,
}: {
  label: string;
  ok: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between py-3">
      <div>
        <p className="font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      {ok ? (
        <span className="flex items-center gap-1 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="size-4" /> configurado
        </span>
      ) : (
        <span className="flex items-center gap-1 text-sm text-amber-700 dark:text-amber-400">
          <XCircle className="size-4" /> falta configurar
        </span>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  const dbOk = !!process.env.DATABASE_URL;
  const authOk = !!process.env.AUTH_SECRET;
  const emailOk = !!process.env.RESEND_API_KEY;
  const mpOk = isMpConfigured();
  const mpSecretOk = !!process.env.MP_WEBHOOK_SECRET;
  const bunnyOk = isBunnyConfigured();
  const bunnySecretOk = !!process.env.BUNNY_WEBHOOK_SECRET;

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Configuración</h1>
      <p className="mt-1 text-muted-foreground">
        Estado de los servicios externos. Las claves se gestionan en{" "}
        <code className="text-xs">.env</code> del servidor — no se editan
        desde acá por seguridad.
      </p>

      <section className="mt-8 rounded-2xl border p-5 divide-y">
        <p className="font-semibold pb-3">Núcleo</p>
        <StatusRow
          label="Base de datos (PostgreSQL)"
          ok={dbOk}
          hint="DATABASE_URL"
        />
        <StatusRow
          label="Auth (Auth.js)"
          ok={authOk}
          hint="AUTH_SECRET"
        />
      </section>

      <section className="mt-6 rounded-2xl border p-5 divide-y">
        <div className="pb-3 flex items-center justify-between">
          <p className="font-semibold">Email (Resend)</p>
          <TestEmailButton />
        </div>
        <StatusRow
          label="API key"
          ok={emailOk}
          hint="RESEND_API_KEY · sin clave los emails se loguean a consola en dev"
        />
        <StatusRow
          label="Remitente"
          ok={!!process.env.EMAIL_FROM}
          hint={process.env.EMAIL_FROM ?? "EMAIL_FROM"}
        />
      </section>

      <section className="mt-6 rounded-2xl border p-5 divide-y">
        <p className="font-semibold pb-3">Mercado Pago</p>
        <StatusRow
          label="Access token"
          ok={mpOk}
          hint="MP_ACCESS_TOKEN · sin esto el checkout corre en modo manual"
        />
        <StatusRow
          label="Webhook secret"
          ok={mpSecretOk}
          hint="MP_WEBHOOK_SECRET · obligatorio en producción"
        />
      </section>

      <section className="mt-6 rounded-2xl border p-5 divide-y">
        <p className="font-semibold pb-3">Bunny Stream</p>
        <StatusRow
          label="API + token auth"
          ok={bunnyOk}
          hint="BUNNY_STREAM_LIBRARY_ID, _API_KEY, _CDN_HOSTNAME, _TOKEN_AUTH_KEY"
        />
        <StatusRow
          label="Webhook secret"
          ok={bunnySecretOk}
          hint="BUNNY_WEBHOOK_SECRET"
        />
      </section>

      <p className="mt-8 text-xs text-muted-foreground">
        Para cambiar estas variables: editá{" "}
        <code className="text-xs">/home/Fitness/.env</code> en el servidor y
        reiniciá la app.
      </p>
    </div>
  );
}
