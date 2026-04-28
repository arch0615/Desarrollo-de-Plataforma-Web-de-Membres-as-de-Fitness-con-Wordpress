export function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="container mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          {title}
        </h1>
        {lastUpdated && (
          <p className="mt-2 text-sm text-muted-foreground">{lastUpdated}</p>
        )}
      </header>
      <div className="prose-content space-y-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-8 [&_h2]:mb-2 [&_p]:text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:text-muted-foreground">
        {children}
      </div>
    </article>
  );
}
