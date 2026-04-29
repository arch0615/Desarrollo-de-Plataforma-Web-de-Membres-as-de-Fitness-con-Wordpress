import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatPrice, intervalLabel, intervalMonths } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Planes de membresía",
  description:
    "Elegí el plan que mejor se adapta a vos. Acceso ilimitado a clases de flexibilidad, movilidad, fuerza y entrenamiento.",
};

const INCLUDED = [
  "Acceso ilimitado a la biblioteca completa",
  "Clases nuevas cada semana",
  "Filtros por categoría, nivel y duración",
  "Favoritos y listas personalizadas",
  "Mirá donde quieras: celu, tablet, compu",
  "Cancelá cuando quieras, sin compromiso",
];

const FAQ = [
  {
    q: "¿Cuándo se cobra?",
    a: "El primer cobro es al suscribirte. Los planes mensuales se renuevan cada mes, los trimestrales cada 3 meses y los anuales cada año.",
  },
  {
    q: "¿Cómo cancelo?",
    a: "Desde tu panel de cuenta, en la sección Suscripción. Mantenés acceso hasta el final del período que ya pagaste — sin penalidades.",
  },
  {
    q: "¿Aceptan tarjetas internacionales?",
    a: "Sí, aceptamos las principales tarjetas de crédito y débito a través de Mercado Pago.",
  },
  {
    q: "¿Hay periodo de prueba?",
    a: "No, pero podés cancelar el primer mes y mantener el acceso hasta el día 30 sin cargos adicionales.",
  },
  {
    q: "¿Puedo cambiar de plan?",
    a: "Sí, podés cambiar de plan en cualquier momento desde tu panel.",
  },
];

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const sp = await searchParams;
  const reason = sp.reason;
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  // Find the monthly plan to compute savings vs other intervals.
  const monthly = plans.find((p) => p.interval === "month");

  return (
    <div>
      {reason === "no-sub" && (
        <div className="container mx-auto px-4 pt-6">
          <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4 max-w-2xl mx-auto text-sm">
            <p className="font-medium">Necesitás una suscripción activa</p>
            <p className="mt-1 text-muted-foreground">
              Elegí un plan para acceder a las clases. Si pagaste recientemente,
              esperá unos minutos a que confirmemos el pago.
            </p>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="container mx-auto px-4 pt-12 sm:pt-16 pb-8 text-center max-w-2xl">
        <Badge variant="secondary" className="mb-4">
          Planes
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          Elegí cómo querés entrenar.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Mismo acceso ilimitado en todos los planes — el más largo te ahorra
          más.
        </p>
      </section>

      {/* PRICING */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {plans.map((p) => {
            const featured = p.interval === "quarter";
            const monthlyEquivalent = Math.round(
              p.priceCents / intervalMonths(p.interval),
            );
            const savings =
              monthly && p.interval !== "month"
                ? Math.round(
                    (1 -
                      monthlyEquivalent / monthly.priceCents) *
                      100,
                  )
                : 0;
            const features = Array.isArray(p.features) ? (p.features as string[]) : [];

            return (
              <div
                key={p.id}
                className={cn(
                  "rounded-3xl border p-6 flex flex-col bg-background relative",
                  featured && "border-foreground shadow-lg",
                )}
              >
                {featured && (
                  <Badge className="absolute -top-3 left-6">
                    <Sparkles className="size-3" /> Más elegido
                  </Badge>
                )}
                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                  {p.name}
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">
                    {formatPrice(p.priceCents, { currency: p.currency })}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    /{intervalLabel(p.interval)}
                  </span>
                </div>
                {p.interval !== "month" && monthly && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Equivale a{" "}
                    {formatPrice(monthlyEquivalent, { currency: p.currency })}/mes
                    {savings > 0 && (
                      <span className="ml-1 text-foreground font-medium">
                        (ahorrás {savings}%)
                      </span>
                    )}
                  </p>
                )}
                <ul className="mt-5 space-y-2">
                  {features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="size-4 mt-0.5 shrink-0 text-foreground" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/registro?plan=${p.slug}`}
                  className={buttonVariants({
                    variant: featured ? "default" : "outline",
                    className: "mt-6",
                  })}
                >
                  Elegir {p.name}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* INCLUDED */}
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-3xl border bg-accent/30 p-8 sm:p-12 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center">
            Todo incluido en cualquier plan
          </h2>
          <ul className="mt-8 grid sm:grid-cols-2 gap-3">
            {INCLUDED.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm sm:text-base"
              >
                <CheckCircle2 className="size-5 mt-0.5 shrink-0 text-foreground" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* TESTIMONIALS — placeholder content; client to provide real ones */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center">
          Lo que dicen las alumnas
        </h2>
        <div className="mt-8 grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[
            {
              quote:
                "Las clases son cortas pero efectivas. Lo mejor: puedo entrenar a la mañana antes del trabajo.",
              name: "Lucía",
              from: "Buenos Aires",
            },
            {
              quote:
                "Pasé de no estirarme nunca a moverme libre. La biblioteca tiene de todo y el nivel sube de a poco.",
              name: "Mariana",
              from: "Córdoba",
            },
            {
              quote:
                "Volví a sentir mi cuerpo. Las explicaciones de Milagros son super claras.",
              name: "Sofía",
              from: "Mendoza",
            },
          ].map((t, i) => (
            <div key={i} className="rounded-2xl border p-5 bg-background">
              <p className="text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 text-sm font-medium">
                {t.name}{" "}
                <span className="text-muted-foreground font-normal">
                  · {t.from}
                </span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-12 max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center">
          Preguntas sobre la membresía
        </h2>
        <Accordion className="mt-6">
          {FAQ.map((f, i) => (
            <AccordionItem key={i} value={`q-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* FINAL CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Empezá cuando estés lista.
        </h2>
        <Link
          href="/registro"
          className={buttonVariants({ size: "lg", className: "mt-6" })}
        >
          Crear mi cuenta
        </Link>
      </section>
    </div>
  );
}
