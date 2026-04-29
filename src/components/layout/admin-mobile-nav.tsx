"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const LINKS: [string, string][] = [
  ["/admin", "Dashboard"],
  ["/admin/clases", "Clases"],
  ["/admin/categorias", "Categorías"],
  ["/admin/miembros", "Miembros"],
  ["/admin/suscripciones", "Suscripciones"],
  ["/admin/pagos", "Pagos"],
  ["/admin/planes", "Planes"],
  ["/admin/configuracion", "Configuración"],
];

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon-sm" aria-label="Abrir menú" />
        }
      >
        <Menu className="size-4" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Admin · Milagros</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3">
          {LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
