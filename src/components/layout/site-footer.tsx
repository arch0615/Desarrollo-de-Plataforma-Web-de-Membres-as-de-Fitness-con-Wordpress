import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground flex flex-col sm:flex-row gap-4 sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Milagros Fitness</p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/terminos" className="hover:text-foreground">
            Términos
          </Link>
          <Link href="/privacidad" className="hover:text-foreground">
            Privacidad
          </Link>
          <a href="mailto:hola@milagros.app" className="hover:text-foreground">
            Contacto
          </a>
        </nav>
      </div>
    </footer>
  );
}
