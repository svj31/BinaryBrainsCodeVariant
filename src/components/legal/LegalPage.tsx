export function LegalPage({
  title,
  updated,
  sections,
  intro,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: { id: string; h: string; body: React.ReactNode }[];
}) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 pb-10 sm:px-6 lg:grid-cols-[220px_1fr]">
      <nav aria-label="On this page" className="hidden lg:block">
        <div className="sticky top-24">
          <p className="eyebrow">On this page</p>
          <ol className="mt-3 space-y-2 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-ink-2 hover:text-ink">
                  {s.h}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>
      <article className="max-w-2xl">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-ink-3">Last updated {updated}</p>
        <p className="mt-6 leading-relaxed text-ink-2">{intro}</p>
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="mt-10 scroll-mt-24">
            <h2 className="font-display text-xl font-semibold">{s.h}</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-ink-2 [&_a]:font-medium [&_a]:text-moss [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
              {s.body}
            </div>
          </section>
        ))}
      </article>
    </div>
  );
}
