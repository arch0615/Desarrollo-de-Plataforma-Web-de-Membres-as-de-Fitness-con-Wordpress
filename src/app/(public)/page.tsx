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
import { formatDuration } from "@/lib/format";

const CATEGORIES = [
  {
    slug: "flexibilidad",
    name: "Flexibilidad",
    icon: Sparkles,
    blurb: "Estiramiento, soltura y rangos largos.",
  },
  {
    slug: "movilidad",
    name: "Movilidad",
    icon: Move,
    blurb: "Articulaciones que se mueven libres.",
  },
  {
    slug: "fuerza",
    name: "Fuerza",
    icon: Dumbbell,
    blurb: "Tonificación y potencia con peso corporal.",
  },
  {
    slug: "entrenamiento",
    name: "Entrenamiento",
    icon: Activity,
    blurb: "Rutinas completas para sumar al día.",
  },
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
];

export default async function HomePage() {
  const featured = await prisma.class.findMany({
    where: { status: "published" },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: 4,
  });

  return (
    <div>
      {/* HERO */}
      <section className="container mx-auto px-4 pt-12 sm:pt-20 pb-12 text-center max-w-3xl">
        <Badge variant="secondary" className="mb-5">
          ✨ Tu Netflix de fitness
        </Badge>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
          Entrenamiento que se adapta a vos.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Flexibilidad, movilidad, fuerza y entrenamiento — clases grabadas,
          listas cuando vos quieras, donde vos quieras.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/membresia"
            className={buttonVariants({ size: "lg" })}
          >
            Ver planes
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Ya soy miembro
          </Link>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            {
              icon: Smartphone,
              title: "En tu bolsillo",
              body: "Entrená desde el celu, la tablet o la compu. Cuando puedas.",
            },
            {
              icon: Clock,
              title: "Clases de 10 a 45 min",
              body: "Filtrá por duración y elegí lo que entra en tu día.",
            },
            {
              icon: Heart,
              title: "Pensadas para vos",
              body: "Niveles desde principiante a avanzado, sin presión.",
            },
          ].map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border p-5 bg-background"
            >
              <v.icon className="size-5 text-foreground" />
              <p className="mt-3 font-medium">{v.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center">
          Cuatro pilares
        </h2>
        <p className="text-center text-muted-foreground mt-2">
          Todo lo que necesitás para sentirte mejor en tu cuerpo.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {CATEGORIES.map((c) => (
            <div
              key={c.slug}
              className="rounded-2xl border p-5 hover:bg-accent transition-colors"
            >
              <c.icon className="size-5" />
              <p className="mt-3 text-lg font-medium">{c.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED CLASSES */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Una probadita
              </h2>
              <p className="text-muted-foreground mt-1">
                Algunas clases de la biblioteca.
              </p>
            </div>
            <Link
              href="/membresia"
              className="text-sm text-muted-foreground underline hidden sm:inline"
            >
              Ver todos los planes
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border overflow-hidden bg-background"
              >
                <div className="aspect-video bg-gradient-to-br from-muted to-muted-foreground/20 grid place-items-center text-muted-foreground/40 text-sm">
                  {c.category.name}
                </div>
                <div className="p-4">
                  <p className="text-xs uppercase text-muted-foreground tracking-wide">
                    {c.category.name} · {formatDuration(c.durationSeconds)}
                  </p>
                  <p className="mt-1 font-medium line-clamp-2">{c.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-3xl border p-8 sm:p-12 bg-accent/30">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center">
            Tres pasos para empezar
          </h2>
          <div className="mt-8 grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                n: "1",
                title: "Elegí tu plan",
                body: "Mensual, trimestral o anual. Cancelás cuando quieras.",
              },
              {
                n: "2",
                title: "Creá tu cuenta",
                body: "Ingresás con tu email y arrancás en menos de un minuto.",
              },
              {
                n: "3",
                title: "Entrenamos",
                body: "Acceso ilimitado a la biblioteca completa. Vos decidís cuándo.",
              },
            ].map((s) => (
              <div key={s.n}>
                <div className="size-10 rounded-full bg-foreground text-background grid place-items-center text-sm font-semibold">
                  {s.n}
                </div>
                <p className="mt-3 font-medium">{s.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/membresia"
              className={buttonVariants({ size: "lg" })}
            >
              Empezar hoy
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-muted to-muted-foreground/20" />
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              Sobre Milagros
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
              Te acompaño en cada clase.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Soy entrenadora y creadora de contenido. Diseño cada rutina para
              que sume valor real a tu día — sin coreografías imposibles, sin
              promesas vacías. Solo movimiento honesto y resultados sostenibles.
            </p>
            <ul className="mt-4 space-y-2">
              {[
                "Clases nuevas cada semana",
                "Niveles desde principiante a avanzado",
                "Acceso desde cualquier dispositivo",
              ].map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="size-4 text-foreground" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-12 max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center">
          Preguntas frecuentes
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
          ¿Lista para empezar?
        </h2>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          Tu plataforma de entrenamiento, accesible desde cualquier dispositivo.
        </p>
        <Link
          href="/membresia"
          className={buttonVariants({ size: "lg", className: "mt-6" })}
        >
          Ver planes
        </Link>
      </section>
    </div>
  );
}
