import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { readAllSources } from "@/lib/resources-library";
import { IngestPanel } from "./_components/IngestPanel";
import { LibraryBrowser, type LibraryItem } from "./_components/LibraryBrowser";

// Reads the local filesystem on every request; never prerender or cache.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Library — EnergyKnowledgeBase (dev)",
  robots: { index: false, follow: false },
};

export default async function LibraryPage() {
  // Local-dev-only tool: depends on local CLI binaries + the gitignored library.
  if (process.env.NODE_ENV === "production") notFound();

  const sources = await readAllSources();
  const items: LibraryItem[] = sources.map((s) => ({ ...s.frontmatter, wordCount: s.wordCount }));
  const words = sources.reduce((n, s) => n + s.wordCount, 0);

  return (
    <main
      id="main-content"
      className="relative z-[1] mx-auto max-w-[var(--container-max)] px-[var(--spacing-4)] sm:px-[var(--spacing-6)]
        py-[var(--spacing-12)]"
    >
      <header className="mb-[var(--spacing-8)]">
        <div className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] uppercase tracking-[0.1em] text-[var(--color-accent-text)] mb-[var(--spacing-2)]">
          EnergyKnowledgeBase · local dev tool
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-[length:var(--text-3xl)] font-semibold tracking-[-0.025em] text-[var(--color-text)] m-0">
          Library
        </h1>
        <p className="font-[family-name:var(--font-body)] text-[length:var(--text-lg)] text-[var(--color-text-muted)] mt-[var(--spacing-3)] max-w-[60ch]">
          Ingest talks and reports, then browse, read, and search the corpus. Files live in the
          gitignored <code className="font-[family-name:var(--font-mono)] text-[length:var(--text-sm)]">EnergyKnowledgeBase/</code> folder — nothing here ships to production.
        </p>
        <p className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] tabular-nums text-[var(--color-text-faint)] mt-[var(--spacing-3)]">
          {sources.length} sources · {words.toLocaleString()} words indexed
        </p>
      </header>

      <IngestPanel />
      <LibraryBrowser items={items} />
    </main>
  );
}
