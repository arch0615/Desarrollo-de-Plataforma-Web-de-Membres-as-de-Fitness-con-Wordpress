import { LegalLayout } from "@/components/layout/legal-layout";

export const metadata = { title: "Política de privacidad" };

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Política de privacidad"
      lastUpdated="Borrador — pendiente de revisión legal"
    >
      <p className="text-sm text-muted-foreground italic">
        Este texto es un borrador genérico. Antes del lanzamiento debe ser
        revisado por un profesional legal o generado con un servicio
        especializado, especialmente para cumplir con la Ley 25.326 (PDPA, AR)
        y, si corresponde, con GDPR.
      </p>

      <h2>1. Qué datos recolectamos</h2>
      <p>
        Recolectamos los datos mínimos necesarios para que la plataforma
        funcione: nombre, email, contraseña (hash), información de pago a
        través de Mercado Pago (no almacenamos tu tarjeta), historial de
        visualización y favoritos.
      </p>

      <h2>2. Para qué los usamos</h2>
      <p>
        Para autenticarte, gestionar tu suscripción, mostrarte progreso y
        recomendaciones, y enviarte emails operativos (verificación, recibos,
        cambios de cuenta).
      </p>

      <h2>3. Con quién los compartimos</h2>
      <p>
        Compartimos solamente lo necesario con: Mercado Pago (procesamiento de
        pagos), Resend (envío de emails), Bunny (alojamiento de video). No
        vendemos tus datos.
      </p>

      <h2>4. Cookies</h2>
      <p>
        Usamos cookies técnicas (sesión, preferencias) necesarias para que la
        plataforma funcione. Más detalle en nuestra{" "}
        <a href="/cookies">política de cookies</a>.
      </p>

      <h2>5. Tus derechos</h2>
      <p>
        Podés acceder, corregir o eliminar tus datos en cualquier momento.
        Escribinos a <a href="mailto:hola@milagros.app">hola@milagros.app</a> y
        respondemos dentro de las 48 horas.
      </p>

      <h2>6. Seguridad</h2>
      <p>
        Las contraseñas se guardan hasheadas (bcrypt). Toda comunicación va
        sobre HTTPS. La base de datos se respalda diariamente.
      </p>

      <h2>7. Cambios</h2>
      <p>
        Si actualizamos esta política avisaremos por email a los miembros
        activos.
      </p>
    </LegalLayout>
  );
}
