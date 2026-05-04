import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  Star,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";
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

const TESTIMONIALS = [
  {
    quote:
      "Las clases son cortas pero efectivas. Lo mejor: puedo entrenar a la mañana antes del trabajo.",
    name: "Lucía",
    from: "Buenos Aires",
    initial: "L",
  },
  {
    quote:
      "Pasé de no estirarme nunca a moverme libre. La biblioteca tiene de todo y el nivel sube de a poco.",
    name: "Mariana",
    from: "Córdoba",
    initial: "M",
  },
  {
    quote:
      "Volví a sentir mi cuerpo. Las explicaciones de Milagros son super claras.",
    name: "Sofía",
    from: "Mendoza",
    initial: "S",
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

  const monthly = plans.find((p) => p.interval === "month");

  return (
    <div className="overflow-x-hidden">
      {reason === "no-sub" && (
        <div className="container mx-auto px-4 pt-6">
          <div className="rounded-2xl border border-brand-amber/40 bg-brand-amber/10 p-4 max-w-2xl mx-auto text-sm">
            <p className="font-semibold flex items-center gap-2">
              <Shield className="size-4 text-brand-amber" />
              Necesitás una suscripción activa
            </p>
            <p className="mt-1 text-muted-foreground">
              Elegí un plan para acceder a las clases. Si pagaste recientemente,
              esperá unos minutos a que confirmemos el pago.
            </p>
          </div>
        </div>
      )}

      {/* HERO with decorative orbs */}
      <section className="relative isolate container mx-auto px-4 pt-16 sm:pt-24 pb-10 text-center max-w-3xl">
        <div className="absolute -top-10 -left-10 size-72 rounded-full bg-brand-coral/15 blur-3xl -z-10" />
        <div className="absolute -top-10 -right-10 size-72 rounded-full bg-brand-amber/15 blur-3xl -z-10" />
        <Badge
          variant="secondary"
          className="mb-5 bg-brand-coral/10 text-brand-coral border-0"
        >
          <Sparkles className="size-3.5" />
          Planes
        </Badge>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          Elegí cómo querés{" "}
          <span className="text-gradient-sunset">entrenar.</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
          Mismo acceso ilimitado en todos los planes — el más largo te ahorra
          más.
        </p>
      </section>

      {/* PRICING */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((p) => {
            const featured = p.interval === "quarter";
            const monthlyEquivalent = Math.round(
              p.priceCents / intervalMonths(p.interval),
            );
            const savings =
              monthly && p.interval !== "month"
                ? Math.round(
                    (1 - monthlyEquivalent / monthly.priceCents) * 100,
                  )
                : 0;
            const features = Array.isArray(p.features)
              ? (p.features as string[])
              : [];

            return (
              <div
                key={p.id}
                className={cn(
                  "relative rounded-3xl flex flex-col bg-card transition-all",
                  featured
                    ? "border-2 border-transparent bg-clip-padding p-[2px] shadow-2xl shadow-brand-coral/20 lg:scale-105 lg:-my-2"
                    : "border p-7 hover:shadow-xl hover:shadow-brand-plum/10 hover:-translate-y-0.5",
                )}
                style={
                  featured
                    ? {
                        backgroundImage:
                          "linear-gradient(var(--card), var(--card)), linear-gradient(135deg, var(--brand-coral), var(--brand-amber))",
                        backgroundOrigin: "border-box",
                        backgroundClip: "padding-box, border-box",
                      }
                    : undefined
                }
              >
                <div className={cn(featured ? "p-7 rounded-[calc(theme(borderRadius.3xl)-2px)]" : "")}>
                  {featured && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sunset border-0 text-white shadow-lg shadow-brand-coral/40 px-3">
                      <Sparkles className="size-3" /> Más elegido
                    </Badge>
                  )}
                  <p className="text-sm uppercase tracking-wider font-semibold text-brand-coral">
                    {p.name}
                  </p>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-5xl font-bold tracking-tight">
                      {formatPrice(p.priceCents, { currency: p.currency })}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      /{intervalLabel(p.interval)}
                    </span>
                  </div>
                  {p.interval !== "month" && monthly && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Equivale a{" "}
                      <span className="font-semibold text-foreground">
                        {formatPrice(monthlyEquivalent, {
                          currency: p.currency,
                        })}
                        /mes
                      </span>
                      {savings > 0 && (
                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-amber/15 text-brand-amber text-xs font-bold">
                          <Zap className="size-3" />
                          ahorrás {savings}%
                        </span>
                      )}
                    </p>
                  )}
                  <div className="my-6 h-px bg-border" />
                  <ul className="space-y-3">
                    {features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-sm"
                      >
                        <div className="size-5 rounded-full bg-brand-coral/15 grid place-items-center shrink-0 mt-0.5">
                          <CheckCircle2 className="size-3 text-brand-coral" />
                        </div>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/registro?plan=${p.slug}`}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "mt-7 w-full h-12 text-base font-semibold transition-all",
                      featured
                        ? "bg-sunset border-0 text-white shadow-lg shadow-brand-coral/30 hover:opacity-95 hover:shadow-brand-coral/40 hover:translate-y-[-1px]"
                        : "bg-foreground text-background hover:bg-foreground/90",
                    )}
                  >
                    Elegir {p.name}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Pago seguro vía Mercado Pago · Cancelás cuando quieras
        </p>
      </section>

      {/* INCLUDED — plum panel with sunset accent corner */}
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="relative rounded-4xl bg-plum-hero overflow-hidden p-10 sm:p-14 texture-grain">
          <div className="absolute -top-20 -right-20 size-72 rounded-full bg-brand-coral/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-brand-amber/20 blur-3xl" />
          <div className="relative">
            <div className="text-center">
              <Badge className="bg-white/15 text-white border-white/20 backdrop-blur-sm">
                Todo incluido
              </Badge>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Lo mismo en{" "}
                <span className="text-gradient-sunset">cada plan</span>
              </h2>
            </div>
            <ul className="mt-10 grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {INCLUDED.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-white/90"
                >
                  <div className="size-7 rounded-full bg-sunset grid place-items-center shrink-0 shadow-md shadow-brand-coral/30">
                    <CheckCircle2 className="size-4 text-white" />
                  </div>
                  <span className="pt-0.5">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-10">
          <Badge
            variant="secondary"
            className="bg-brand-amber/15 text-brand-amber border-0"
          >
            Alumnas reales
          </Badge>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
            Lo que dicen{" "}
            <span className="text-gradient-sunset">las alumnas</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border bg-card p-6 hover:shadow-xl hover:shadow-brand-plum/10 hover:-translate-y-1 transition-all"
            >
              <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="size-4 fill-brand-amber text-brand-amber"
                  />
                ))}
              </div>
              <p className="text-base leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 pt-5 border-t flex items-center gap-3">
                <div className="size-10 rounded-full bg-sunset grid place-items-center text-white font-bold">
                  {t.initial}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.from}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 pb-16 max-w-2xl">
        <div className="text-center mb-8">
          <Badge
            variant="secondary"
            className="bg-brand-teal/15 text-brand-teal border-0"
          >
            FAQ
          </Badge>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
            Preguntas sobre la membresía
          </h2>
        </div>
        <Accordion>
          {FAQ.map((f, i) => (
            <AccordionItem key={i} value={`q-${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* FINAL CTA */}
      <section className="container mx-auto px-4 pb-20 max-w-5xl">
        <div className="relative rounded-4xl bg-sunset overflow-hidden p-12 sm:p-16 text-center texture-grain">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Empezá cuando estés lista.
          </h2>
          <p className="mt-4 text-white/90 max-w-md mx-auto">
            Crear cuenta es gratis — pagás solo cuando elijas tu plan.
          </p>
          <Link
            href="/registro"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-8 bg-white text-brand-coral hover:bg-white/95 hover:translate-y-[-1px] transition-all h-12 px-8 text-base font-bold shadow-xl",
            )}
          >
            Crear mi cuenta
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
