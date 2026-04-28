import { LegalLayout } from "@/components/layout/legal-layout";

export const metadata = { title: "Política de cookies" };

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Política de cookies"
      lastUpdated="Borrador — pendiente de revisión legal"
    >
      <p>
        Usamos cookies estrictamente necesarias para que el inicio de sesión,
        la suscripción y la reproducción de las clases funcionen
        correctamente. No usamos cookies de marketing ni de terceros para
        rastrearte fuera del sitio.
      </p>

      <h2>Qué cookies usamos</h2>
      <ul>
        <li>
          <strong>Sesión:</strong> mantienen tu inicio de sesión activo entre
          páginas.
        </li>
        <li>
          <strong>Preferencias:</strong> guardan ajustes simples como tu
          consentimiento de cookies.
        </li>
      </ul>

      <h2>Cómo desactivarlas</h2>
      <p>
        Podés borrar las cookies desde la configuración de tu navegador. Si lo
        hacés, vas a tener que volver a iniciar sesión.
      </p>
    </LegalLayout>
  );
}
