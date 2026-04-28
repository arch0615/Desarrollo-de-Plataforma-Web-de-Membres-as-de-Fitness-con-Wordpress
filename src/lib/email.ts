import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "Milagros Fitness <noreply@milagros.app>";

const resend = apiKey ? new Resend(apiKey) : null;

type SendArgs = { to: string; subject: string; html: string };

export async function sendEmail({ to, subject, html }: SendArgs) {
  if (!resend) {
    // Dev fallback: log to console so flows are testable without Resend creds.
    console.log(
      `\n📧 [email stub] to=${to}\n   subject=${subject}\n   html=\n${html}\n`,
    );
    return { id: "stub" };
  }
  const { data, error } = await resend.emails.send({ from, to, subject, html });
  if (error) throw new Error(error.message);
  return { id: data?.id ?? "unknown" };
}

export function verifyEmailTemplate(opts: { name: string; url: string }) {
  return `
    <div style="font-family: ui-sans-serif, system-ui; max-width: 480px; margin: 0 auto;">
      <h2>Hola ${escapeHtml(opts.name)} 👋</h2>
      <p>Confirmá tu email para activar tu cuenta en <strong>Milagros Fitness</strong>:</p>
      <p><a href="${opts.url}" style="background:#111; color:#fff; padding:12px 20px; text-decoration:none; border-radius:8px; display:inline-block;">Verificar email</a></p>
      <p style="color:#666; font-size:12px;">Si no creaste esta cuenta, podés ignorar este mensaje.</p>
    </div>
  `;
}

export function resetEmailTemplate(opts: { name: string; url: string }) {
  return `
    <div style="font-family: ui-sans-serif, system-ui; max-width: 480px; margin: 0 auto;">
      <h2>Hola ${escapeHtml(opts.name)}</h2>
      <p>Recibimos un pedido para restablecer tu contraseña en <strong>Milagros Fitness</strong>.</p>
      <p><a href="${opts.url}" style="background:#111; color:#fff; padding:12px 20px; text-decoration:none; border-radius:8px; display:inline-block;">Crear nueva contraseña</a></p>
      <p style="color:#666; font-size:12px;">Este enlace caduca en 1 hora. Si no lo pediste, podés ignorar este mensaje.</p>
    </div>
  `;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
