import Link from "next/link";
import { Sparkles, Quote } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh grid lg:grid-cols-2">
      {/* Form column */}
      <div className="flex flex-col">
        <header className="container mx-auto px-6 py-5">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="size-8 rounded-xl bg-sunset grid place-items-center shadow-md shadow-brand-coral/30 group-hover:scale-105 transition-transform">
              <Sparkles className="size-4 text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg">
              Milagros <span className="text-gradient-sunset">Fitness</span>
            </span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">{children}</div>
        </main>
        <footer className="container mx-auto px-6 py-5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← Volver al inicio
          </Link>
        </footer>
      </div>

      {/* Photo column — hidden on mobile */}
      <aside className="hidden lg:block relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1400&q=80&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-plum-hero opacity-90 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.17_0.05_350)/0.7] via-transparent to-transparent" />
        <div className="absolute inset-0 texture-grain" />

        <div className="relative h-full flex flex-col justify-end p-12 text-white">
          <div className="max-w-md">
            <Quote className="size-10 text-brand-amber mb-4" />
            <blockquote className="text-2xl font-semibold leading-snug">
              &ldquo;Pasé de no estirarme nunca a moverme libre. La biblioteca
              tiene de todo y el nivel sube de a poco.&rdquo;
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="size-10 rounded-full bg-sunset grid place-items-center font-bold">
                M
              </div>
              <div>
                <p className="font-semibold">Mariana</p>
                <p className="text-sm text-white/70">Alumna desde 2024</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
