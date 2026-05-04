import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClassCard, type ClassCardData } from "./class-card";

export function ClassRow({
  title,
  href,
  classes,
}: {
  title: string;
  href?: string;
  classes: ClassCardData[];
}) {
  if (classes.length === 0) return null;
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="text-sm font-medium text-brand-coral hover:underline inline-flex items-center gap-1 shrink-0"
          >
            Ver todo
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
      <div className="-mx-4 sm:mx-0 overflow-x-auto scrollbar-none">
        <div className="flex gap-3 sm:gap-4 px-4 sm:px-0 snap-x snap-mandatory">
          {classes.map((c) => (
            <div
              key={c.id}
              className="snap-start shrink-0 basis-[calc(70%)] sm:basis-[calc(40%)] md:basis-[calc(30%)] lg:basis-[calc(22%)]"
            >
              <ClassCard c={c} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
