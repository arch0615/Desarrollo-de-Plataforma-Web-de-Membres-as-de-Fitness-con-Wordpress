import Link from "next/link";
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
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
          {title}
        </h2>
        {href && (
          <Link href={href} className="text-sm text-muted-foreground underline">
            Ver todo
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
