import { LegalLayout } from "@/components/layout/legal-layout";

export const metadata = { title: "Términos y condiciones" };

export default function TermsPage() {
  return (
    <LegalLayout
      title="Términos y condiciones"
      lastUpdated="Borrador — pendiente de revisión legal"
    >
      <p className="text-sm text-muted-foreground italic">
        Este texto es un borrador genérico. Antes del lanzamiento debe ser
        revisado por un profesional legal o generado a través de un servicio
        especializado (Termly, iubenda, etc.) con los datos reales del negocio.
      </p>

      <h2>1. Aceptación</h2>
      <p>
        Al crear una cuenta y/o suscribirte a Milagros Fitness aceptás estos
        términos. Si no estás de acuerdo, por favor no utilices la plataforma.
      </p>

      <h2>2. La plataforma</h2>
      <p>
        Milagros Fitness es una plataforma online de membresía que ofrece
        acceso a una biblioteca de clases grabadas de flexibilidad,
        movilidad, fuerza y entrenamiento.
      </p>

      <h2>3. Cuenta de usuario</h2>
      <p>
        Sos responsable de mantener la confidencialidad de tu contraseña y de
        toda actividad que ocurra bajo tu cuenta. La cuenta es personal e
        intransferible.
      </p>

      <h2>4. Membresía y pagos</h2>
      <p>
        El acceso al contenido es a través de un plan de membresía con cobro
        recurrente. Podés cancelar en cualquier momento desde tu panel; el
        acceso continúa hasta el final del período pago.
      </p>

      <h2>5. Uso del contenido</h2>
      <p>
        El contenido es para uso personal. No está permitido descargar,
        reproducir, redistribuir o compartir las clases fuera de la plataforma.
      </p>

      <h2>6. Salud y aptitud física</h2>
      <p>
        Las clases son de carácter educativo y de bienestar general. No
        sustituyen el consejo de un profesional médico. Antes de iniciar
        cualquier rutina consultá a tu médico, especialmente si tenés
        condiciones preexistentes, lesiones o estás embarazada.
      </p>

      <h2>7. Modificaciones</h2>
      <p>
        Podemos actualizar estos términos. Los cambios entran en vigencia al
        publicarse en esta página. Te avisaremos por email si los cambios son
        significativos.
      </p>

      <h2>8. Contacto</h2>
      <p>
        Si tenés dudas, escribinos a{" "}
        <a href="mailto:hola@milagros.app">hola@milagros.app</a>.
      </p>
    </LegalLayout>
  );
}
