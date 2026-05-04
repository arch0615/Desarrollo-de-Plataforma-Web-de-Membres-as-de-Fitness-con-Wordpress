import Link from "next/link";
import {
  Sparkles,
  Activity,
  Dumbbell,
  Move,
  Smartphone,
  Clock,
  Heart,
  CheckCircle2,
  Play,
  ArrowRight,
  Star,
  HelpCircle,
  MessageCircle,
} from "lucide-react";
import { ChevronDown, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

const UNSPLASH = (id: string, w = 1600, h?: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}${h ? `&h=${h}` : ""}&q=80&auto=format&fit=crop`;

const CATEGORIES = [
  {
    slug: "flexibilidad",
    name: "Flexibilidad",
    icon: Sparkles,
    blurb: "Estiramiento, soltura y rangos largos.",
    img: UNSPLASH("1599058917212-d750089bc07e", 800, 1000),
    overlay: "from-brand-coral/90 via-brand-coral/40 to-transparent",
  },
  {
    slug: "movilidad",
    name: "Movilidad",
    icon: Move,
    blurb: "Articulaciones que se mueven libres.",
    img: UNSPLASH("1578762560042-46ad127c95ea", 800, 1000),
    overlay: "from-brand-teal/90 via-brand-teal/40 to-transparent",
  },
  {
    slug: "fuerza",
    name: "Fuerza",
    icon: Dumbbell,
    blurb: "Tonificación y potencia con peso corporal.",
    img: UNSPLASH("1583454110551-21f2fa2afe61", 800, 1000),
    overlay: "from-brand-plum/90 via-brand-plum/50 to-transparent",
  },
  {
    slug: "entrenamiento",
    name: "Entrenamiento",
    icon: Activity,
    blurb: "Rutinas completas para sumar al día.",
    img: UNSPLASH("1517836357463-d25dfeac3438", 800, 1000),
    overlay: "from-brand-amber/90 via-brand-amber/40 to-transparent",
  },
];

const FEATURED_FALLBACK_IMAGES = [
  UNSPLASH("1549576490-b0b4831ef60a", 800, 450),
  UNSPLASH("1601925260368-ae2f83cf8b7f", 800, 450),
  UNSPLASH("1593810450967-f9c42742e326", 800, 450),
  UNSPLASH("1532384748853-8f54a8f476e2", 800, 450),
];

const FAQ = [
  {
    q: "¿Cómo funciona la membresía?",
    a: "Te suscribís, ingresás con tu usuario y contraseña, y accedés a toda la biblioteca de clases las 24 horas, los 365 días del año.",
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí, sin penalidades. Cancelás desde tu panel y mantenés acceso hasta el final del período pago.",
  },
  {
    q: "¿En qué dispositivos puedo entrenar?",
    a: "Donde tengas un navegador: celular, tablet, notebook o smart TV con navegador. Los videos se adaptan automáticamente.",
  },
  {
    q: "¿Cuánto duran las clases?",
    a: "Tenemos clases desde 10 minutos hasta sesiones largas de 45+. Filtrás por duración para encajar en tu día.",
  },
  {
    q: "¿Qué necesito para empezar?",
    a: "Una colchoneta y muchas ganas. Si una clase requiere algún elemento extra (banda, mancuernas), lo verás antes de comenzar.",
  },
  {
    q: "¿Las clases son en vivo?",
    a: "Por ahora todas son grabadas, pensadas para que entrenes en tu tiempo. Si te interesan clases en vivo, escribime y vamos sumando.",
  },
  {
    q: "¿En cuánto tiempo voy a ver resultados?",
    a: "Depende de tu punto de partida y constancia, pero la mayoría de las alumnas notan mejoras en flexibilidad y energía en 3-4 semanas entrenando 3 veces por semana. Lo importante es la constancia, no la intensidad.",
  },
  {
    q: "Soy principiante absoluta — ¿esto es para mí?",
    a: "Totalmente. Tenemos un nivel principiante con clases pensadas desde cero, sin presión. Cada clase indica nivel y elementos necesarios para que sepas si encaja con vos antes de empezar.",
  },
  {
    q: "¿Hay reembolsos?",
    a: "Si tenés un problema con el cobro, escribime y lo resolvemos. Como podés cancelar en cualquier momento sin penalidad, no manejamos reembolsos por arrepentimiento — pero tu acceso se mantiene hasta el final del período que pagaste.",
  },
  {
    q: "¿Necesito instalar una app?",
    a: "No, todo funciona desde el navegador. Si querés, podés agregar el sitio a tu pantalla de inicio en el celular para que se abra como una app — sin pasar por una tienda.",
  },
  {
    q: "¿Puedo cambiar de plan más adelante?",
    a: "Sí. Desde tu panel podés cambiar entre mensual, trimestral y anual cuando quieras. El cambio se aplica al final del período actual.",
  },
];

export default async function HomePage() {
  const featured = await prisma.class.findMany({
    where: { status: "published" },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: 4,
  });

  return (
    <div className="overflow-x-hidden">
      {/* HERO — full-bleed plum gradient + photographic backdrop */}
      <section className="relative isolate">
        <div className="absolute inset-0 bg-plum-hero texture-grain" />
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={UNSPLASH("1571019613454-1cb2f99b2d8b", 2000)}
            alt=""
            className="h-full w-full object-cover opacity-25 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.17_0.05_350)/0.95] via-[oklch(0.17_0.05_350)/0.7] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 pt-20 pb-32 sm:pt-28 sm:pb-40 max-w-6xl">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-6 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15"
            >
              <Sparkles className="size-3.5 text-brand-amber" />
              Tu Netflix de fitness
            </Badge>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]">
              Entrenamiento que se adapta{" "}
              <span className="text-gradient-sunset">a vos.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed">
              Flexibilidad, movilidad, fuerza y entrenamiento — clases grabadas,
              listas cuando vos quieras, donde vos quieras.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="/membresia"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-sunset border-0 text-white shadow-xl shadow-brand-coral/30 hover:opacity-95 hover:shadow-brand-coral/40 hover:translate-y-[-1px] transition-all h-12 px-7 text-base",
                )}
              >
                Empezar ahora
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "bg-white/10 border-white/30 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white h-12 px-7 text-base",
                )}
              >
                <Play className="size-4 fill-white" />
                Ya soy miembro
              </Link>
            </div>

            {/* Social proof strip */}
            <div className="mt-12 flex flex-wrap items-center gap-6 text-white/70">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="size-4 fill-brand-amber text-brand-amber"
                    />
                  ))}
                </div>
                <span className="text-sm">4.9 / 5 de nuestras alumnas</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-white/20" />
              <p className="text-sm">+200 clases · 4 pilares · 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPS — overlapping floating panel */}
      <section className="container mx-auto px-4 -mt-20 relative z-10 max-w-5xl">
        <div className="grid sm:grid-cols-3 gap-4 rounded-3xl border bg-card p-3 shadow-2xl shadow-brand-plum/10">
          {[
            {
              icon: Smartphone,
              title: "En tu bolsillo",
              body: "Entrená desde el celu, la tablet o la compu. Cuando puedas.",
              tint: "bg-brand-coral/10 text-brand-coral",
            },
            {
              icon: Clock,
              title: "Clases de 10 a 45 min",
              body: "Filtrá por duración y elegí lo que entra en tu día.",
              tint: "bg-brand-amber/15 text-brand-amber",
            },
            {
              icon: Heart,
              title: "Pensadas para vos",
              body: "Niveles desde principiante a avanzado, sin presión.",
              tint: "bg-brand-teal/15 text-brand-teal",
            },
          ].map((v) => (
            <div
              key={v.title}
              className="rounded-2xl p-6 bg-background hover:bg-secondary/40 transition-colors"
            >
              <div
                className={cn(
                  "size-11 rounded-xl grid place-items-center",
                  v.tint,
                )}
              >
                <v.icon className="size-5" />
              </div>
              <p className="mt-4 font-semibold text-base">{v.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES — visual photo cards with color overlays */}
      <section className="container mx-auto px-4 py-24 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto">
          <Badge
            variant="secondary"
            className="bg-brand-coral/10 text-brand-coral border-0"
          >
            Cuatro pilares
          </Badge>
          <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight">
            Todo lo que necesitás
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Una biblioteca pensada para sentirte mejor en tu cuerpo.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {CATEGORIES.map((c) => (
            <div
              key={c.slug}
              className="group relative aspect-[3/4] rounded-3xl overflow-hidden border bg-card cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.img}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t",
                  c.overlay,
                )}
              />
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                <div className="size-9 rounded-lg bg-white/20 backdrop-blur-sm grid place-items-center mb-3 transition-transform group-hover:-translate-y-1">
                  <c.icon className="size-4" />
                </div>
                <p className="text-xl font-bold tracking-tight">{c.name}</p>
                <p className="mt-1 text-sm text-white/85 line-clamp-2">
                  {c.blurb}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED CLASSES */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 pb-24 max-w-6xl">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <Badge
                variant="secondary"
                className="bg-brand-amber/15 text-brand-amber border-0"
              >
                Una probadita
              </Badge>
              <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight">
                Recién agregadas
              </h2>
              <p className="text-muted-foreground mt-2">
                Algunas clases de la biblioteca.
              </p>
            </div>
            <Link
              href="/membresia"
              className="text-sm font-medium text-brand-coral hover:underline inline-flex items-center gap-1"
            >
              Ver todos los planes
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((c, i) => (
              <div
                key={c.id}
                className="group rounded-2xl border overflow-hidden bg-card hover:shadow-xl hover:shadow-brand-plum/10 hover:-translate-y-1 transition-all"
              >
                <div className="relative aspect-video overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      c.thumbnailUrl ??
                      FEATURED_FALLBACK_IMAGES[i % FEATURED_FALLBACK_IMAGES.length]
                    }
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/90 text-foreground border-0 backdrop-blur-sm font-semibold">
                      {c.category.name}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm">
                      <Clock className="size-3" />
                      {formatDuration(c.durationSeconds)}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-semibold line-clamp-2 group-hover:text-brand-coral transition-colors">
                    {c.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* HOW IT WORKS — sunset gradient panel */}
      <section className="container mx-auto px-4 pb-24 max-w-6xl">
        <div className="relative rounded-4xl bg-sunset p-10 sm:p-16 overflow-hidden texture-grain">
          <div className="relative max-w-4xl mx-auto">
            <div className="text-center">
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                Tres pasos
              </Badge>
              <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-white">
                Empezás en menos de un minuto
              </h2>
            </div>
            <div className="mt-12 grid sm:grid-cols-3 gap-6">
              {[
                {
                  n: "1",
                  title: "Elegí tu plan",
                  body: "Mensual, trimestral o anual. Cancelás cuando quieras.",
                },
                {
                  n: "2",
                  title: "Creá tu cuenta",
                  body: "Ingresás con tu email y arrancás al instante.",
                },
                {
                  n: "3",
                  title: "Entrenamos",
                  body: "Acceso ilimitado a la biblioteca. Vos decidís cuándo.",
                },
              ].map((s) => (
                <div
                  key={s.n}
                  className="rounded-2xl bg-white/15 backdrop-blur-sm p-6 border border-white/20"
                >
                  <div className="size-12 rounded-2xl bg-white text-brand-coral grid place-items-center text-xl font-bold shadow-lg">
                    {s.n}
                  </div>
                  <p className="mt-4 font-bold text-lg text-white">{s.title}</p>
                  <p className="mt-1 text-sm text-white/85">{s.body}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/membresia"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-white text-brand-coral hover:bg-white/95 hover:translate-y-[-1px] transition-all h-12 px-8 text-base font-bold shadow-xl",
                )}
              >
                Empezar hoy
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="container mx-auto px-4 pb-24 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 size-24 rounded-full bg-brand-amber/30 blur-2xl" />
            <div className="absolute -bottom-4 -right-4 size-32 rounded-full bg-brand-coral/30 blur-2xl" />
            <div className="relative aspect-square rounded-3xl overflow-hidden border-4 border-card shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={UNSPLASH("1518611012118-696072aa579a", 800, 800)}
                alt="Milagros entrenando"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div>
            <Badge
              variant="secondary"
              className="bg-brand-plum/10 text-brand-plum border-0"
            >
              Sobre Milagros
            </Badge>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
              Te acompaño en{" "}
              <span className="text-gradient-sunset">cada clase.</span>
            </h2>
            <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
              Soy entrenadora y creadora de contenido. Diseño cada rutina para
              que sume valor real a tu día — sin coreografías imposibles, sin
              promesas vacías. Solo movimiento honesto y resultados sostenibles.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Clases nuevas cada semana",
                "Niveles desde principiante a avanzado",
                "Acceso desde cualquier dispositivo",
              ].map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-3 text-base"
                >
                  <div className="size-6 rounded-full bg-brand-coral/15 grid place-items-center shrink-0">
                    <CheckCircle2 className="size-3.5 text-brand-coral" />
                  </div>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative container mx-auto px-4 pb-24 max-w-3xl">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 size-72 rounded-full bg-brand-teal/15 blur-3xl -z-10" />
        <div className="text-center">
          <Badge
            variant="secondary"
            className="bg-brand-teal/15 text-brand-teal border-0"
          >
            <HelpCircle className="size-3.5" />
            Preguntas frecuentes
          </Badge>
          <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight">
            Lo que más nos{" "}
            <span className="text-gradient-sunset">preguntan</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Si no encontrás tu respuesta, escribinos al final.
          </p>
        </div>

        {/* Card-stack: each Q&A is a native <details> for guaranteed reliability */}
        <div className="mt-10 space-y-3">
          {FAQ.map((f, i) => (
            <details
              key={i}
              open={i === 0}
              className="group/faq rounded-2xl border bg-card px-5 sm:px-6 transition-all hover:border-brand-coral/40 hover:shadow-md hover:shadow-brand-plum/5 open:border-brand-coral/40 open:shadow-md open:shadow-brand-plum/5"
            >
              <summary className="flex items-center gap-3 py-5 cursor-pointer list-none text-base font-semibold transition-colors group-hover/faq:text-brand-coral group-open/faq:text-brand-coral [&::-webkit-details-marker]:hidden">
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-coral/10 text-[11px] font-bold text-brand-coral transition-colors group-hover/faq:bg-brand-coral group-hover/faq:text-white group-open/faq:bg-brand-coral group-open/faq:text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{f.q}</span>
                <ChevronDown className="size-4 shrink-0 text-brand-coral transition-transform duration-200 group-open/faq:rotate-180" />
              </summary>
              <p className="pl-9 pr-2 pb-5 text-muted-foreground leading-relaxed">
                {f.a}
              </p>
            </details>
          ))}
        </div>

        {/* Support CTA — multi-channel */}
        <div className="mt-10 relative rounded-3xl border bg-card overflow-hidden">
          <div className="absolute -top-16 -right-16 size-48 rounded-full bg-brand-coral/15 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-brand-amber/15 blur-3xl" />

          <div className="relative p-8 sm:p-10">
            <div className="text-center max-w-md mx-auto">
              <div className="size-14 mx-auto rounded-2xl bg-sunset grid place-items-center shadow-lg shadow-brand-coral/30">
                <MessageCircle className="size-6 text-white" />
              </div>
              <h3 className="mt-5 text-2xl sm:text-3xl font-bold tracking-tight">
                ¿Te quedó <span className="text-gradient-sunset">otra duda?</span>
              </h3>
              <p className="mt-2 text-muted-foreground">
                Estoy del otro lado para ayudarte. Elegí el canal que más te
                guste — respondo en menos de 24 horas.
              </p>
            </div>

            {/* Contact channels */}
            <div className="mt-8 grid sm:grid-cols-3 gap-3">
              <Link
                href="mailto:hola@milagrosfitness.com"
                className="group/ch rounded-2xl border bg-background p-5 transition-all hover:border-brand-coral/40 hover:shadow-md hover:shadow-brand-plum/10 hover:-translate-y-0.5"
              >
                <div className="size-10 rounded-xl bg-brand-coral/10 grid place-items-center transition-colors group-hover/ch:bg-brand-coral group-hover/ch:text-white">
                  <Mail className="size-5 text-brand-coral group-hover/ch:text-white transition-colors" />
                </div>
                <p className="mt-3 font-bold">Mail</p>
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                  hola@milagrosfitness.com
                </p>
                <p className="mt-3 text-xs font-semibold text-brand-coral inline-flex items-center gap-1">
                  Escribir
                  <ArrowRight className="size-3 transition-transform group-hover/ch:translate-x-0.5" />
                </p>
              </Link>

              <Link
                href="https://wa.me/5491100000000?text=Hola%20Milagros%2C%20tengo%20una%20consulta"
                target="_blank"
                rel="noopener"
                className="group/ch rounded-2xl border bg-background p-5 transition-all hover:border-emerald-500/40 hover:shadow-md hover:shadow-brand-plum/10 hover:-translate-y-0.5"
              >
                <div className="size-10 rounded-xl bg-emerald-500/10 grid place-items-center transition-colors group-hover/ch:bg-emerald-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-5 text-emerald-600 group-hover/ch:text-white transition-colors"
                    aria-hidden
                  >
                    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                  </svg>
                </div>
                <p className="mt-3 font-bold">WhatsApp</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  +54 9 11 0000-0000
                </p>
                <p className="mt-3 text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                  Chatear
                  <ArrowRight className="size-3 transition-transform group-hover/ch:translate-x-0.5" />
                </p>
              </Link>

              <Link
                href="https://instagram.com/milagrosfitness"
                target="_blank"
                rel="noopener"
                className="group/ch rounded-2xl border bg-background p-5 transition-all hover:border-brand-amber/40 hover:shadow-md hover:shadow-brand-plum/10 hover:-translate-y-0.5"
              >
                <div className="size-10 rounded-xl bg-brand-amber/15 grid place-items-center transition-colors group-hover/ch:bg-brand-amber">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5 text-brand-amber group-hover/ch:text-white transition-colors"
                    aria-hidden
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
                <p className="mt-3 font-bold">Instagram</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  @milagrosfitness
                </p>
                <p className="mt-3 text-xs font-semibold text-brand-amber inline-flex items-center gap-1">
                  Seguir
                  <ArrowRight className="size-3 transition-transform group-hover/ch:translate-x-0.5" />
                </p>
              </Link>
            </div>

            {/* Trust footer */}
            <div className="mt-7 pt-6 border-t flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Respondemos lun a vie, 9 a 18 hs
              </span>
              <span className="hidden sm:inline opacity-30">·</span>
              <span>Atención humana, no chatbots</span>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA — plum hero with sunset CTA */}
      <section className="container mx-auto px-4 pb-20 max-w-6xl">
        <div className="relative rounded-4xl bg-plum-hero overflow-hidden texture-grain p-12 sm:p-20 text-center">
          <div className="absolute -top-20 -right-20 size-72 rounded-full bg-brand-coral/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-brand-amber/20 blur-3xl" />
          <div className="relative">
            <Badge className="bg-white/15 text-white border-white/20 backdrop-blur-sm">
              <Sparkles className="size-3.5 text-brand-amber" />
              Probá 7 días
            </Badge>
            <h2 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-2xl mx-auto leading-tight">
              ¿Lista para{" "}
              <span className="text-gradient-sunset">empezar?</span>
            </h2>
            <p className="mt-5 text-lg text-white/80 max-w-md mx-auto">
              Tu plataforma de entrenamiento, accesible desde cualquier
              dispositivo.
            </p>
            <Link
              href="/membresia"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 bg-sunset border-0 text-white shadow-xl shadow-brand-coral/30 hover:opacity-95 hover:translate-y-[-1px] transition-all h-12 px-8 text-base font-bold",
              )}
            >
              Ver planes
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
