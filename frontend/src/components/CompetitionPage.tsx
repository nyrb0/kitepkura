"use client";

import ClientPdfViewer from "@/components/ClientPdfViewer";

export interface CompetitionSection {
  title?: string;
  items: string[];
}

interface CompetitionPageProps {
  title: string;
  subtitle: string;
  description: string[];
  sections: CompetitionSection[];
  pdfUrl: string;
  pdfFileName: string;
}

export default function CompetitionPage({
  title,
  subtitle,
  description,
  sections,
  pdfUrl,
  pdfFileName,
}: CompetitionPageProps) {
  return (
    <main className="min-h-[100dvh] bg-background text-text">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-700">
            Конкурс 2025
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-text sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-base leading-7 text-text-muted sm:text-lg">
            {subtitle}
          </p>
          <div className="mt-6 space-y-4 text-sm leading-7 text-text sm:text-base">
            {description.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="text-xl font-semibold text-text">PDF документ</h2>
            <p className="mt-2 text-sm text-text-muted">
              Жүктөп алуу жана карап чыгуу үчүн документ.
            </p>
            <div className="mt-6">
              <ClientPdfViewer fileUrl={pdfUrl} fileName={pdfFileName} />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="text-xl font-semibold text-text">Авторлор</h2>
            <div className="mt-6 space-y-6">
              {sections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {section.title && (
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-text-muted">
                      {section.title}
                    </h3>
                  )}
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-text">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="list-disc pl-5">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
