import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4">
      <section className="py-16 sm:py-24 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight">
          Tu Netflix de fitness, hecho con amor.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Flexibilidad, movilidad, fuerza y entrenamiento — clases grabadas
          listas para vos, donde y cuando quieras.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/membresia" className={buttonVariants({ size: "lg" })}>
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

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-20">
        {[
          { name: "Flexibilidad", slug: "flexibilidad" },
          { name: "Movilidad", slug: "movilidad" },
          { name: "Fuerza", slug: "fuerza" },
          { name: "Entrenamiento", slug: "entrenamiento" },
        ].map((c) => (
          <div
            key={c.slug}
            className="rounded-2xl border p-6 hover:bg-accent transition-colors"
          >
            <p className="text-sm text-muted-foreground">Categoría</p>
            <p className="text-xl font-medium mt-1">{c.name}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
