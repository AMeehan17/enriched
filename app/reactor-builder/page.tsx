import { Suspense } from "react";
import type { Metadata } from "next";
import { reactorTaxonomy } from "@/data-src/reactor-taxonomy";
import { reactors } from "@/data-src/reactors";
import { ReactorBuilderView } from "./_components/ReactorBuilderView";

/**
 * /reactor-builder — Module 2: Reactor Builder.
 *
 * Server component. Reads typed data from data-src/ at build time and
 * passes it to the client component that owns the interactive state.
 *
 * Server/client boundary (per the eng review):
 *   - This file: server. Imports data, renders the shell + hero, provides
 *     metadata.
 *   - ReactorBuilderView: client. Owns nuqs URL state, renders chip steps,
 *     spec card, match list, popovers.
 *
 * Rendering mode: STATIC prerender (per CEO + eng review). Unlike Module 1's
 * /compare which reads searchParams in generateMetadata to bake per-preset
 * OG images, this route does not yet have per-configuration OG images.
 * Block 4 ships the static shell; OG images land in v1.1 via a separate
 * /og/reactor-builder route (see TODOs.md for the bundled Module 1 + 2 OG work).
 *
 * That means this page component does NOT read searchParams — the nuqs
 * state lives entirely in the client component and does not affect
 * initial HTML. Suspense handles the CSR bailout nuqs requires.
 */

const TITLE = "Reactor Builder — Enriched";
const DESCRIPTION =
  "Build a reactor. Pick a fuel, a coolant, and a capability. See which real-world designs match — and why the choices matter.";
const SITE_ORIGIN = "https://enriched-delta.vercel.app";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_ORIGIN}/reactor-builder`,
    siteName: "Enriched",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

/**
 * Fallback shown while the client component hydrates. Matches the final
 * layout's vertical rhythm so there's no layout shift between fallback
 * and hydrated state.
 */
function ReactorBuilderFallback() {
  return (
    <div
      className="border-t border-[var(--color-rule-strong)] pt-[var(--spacing-6)] py-[var(--spacing-24)] text-center"
      aria-live="polite"
    >
      <p className="font-[family-name:var(--font-display)] text-[length:var(--text-sm)] text-[var(--color-text-faint)] uppercase tracking-[0.1em]">
        {"/ Loading reactor builder..."}
      </p>
    </div>
  );
}

export default function ReactorBuilderPage() {
  return (
    <main id="main-content" className="relative z-[1]">
      {/* Hero — labelled by its h1 so screen reader region nav announces
          it as "Build a reactor. Learn what the choices mean, region". */}
      <section
        aria-labelledby="page-title"
        className="mx-auto max-w-[var(--container-max)] px-[var(--spacing-4)] sm:px-[var(--spacing-6)] pt-[var(--spacing-8)] sm:pt-[var(--spacing-16)] pb-[var(--spacing-6)] sm:pb-[var(--spacing-8)]"
      >
        <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.1em] text-[var(--color-text-muted)] mb-[var(--spacing-3)]">
          {"// Module 02"}
        </p>
        <h1
          id="page-title"
          className="font-[family-name:var(--font-display)] text-[length:var(--text-2xl)] sm:text-[length:var(--text-3xl)] lg:text-[length:var(--text-4xl)] font-medium tracking-[-0.025em] leading-[1.05] mb-[var(--spacing-4)] sm:mb-[var(--spacing-6)] max-w-[900px]"
        >
          <span className="block">Build a reactor.</span>
          <span className="block">Learn what the choices mean.</span>
        </h1>
        <p className="font-[family-name:var(--font-body)] text-[length:var(--text-base)] sm:text-[length:var(--text-lg)] leading-[1.55] text-[var(--color-text-muted)] max-w-[640px]">
          Pick a fuel, a coolant, and a capability. See which real-world
          designs match — and why the choices matter.
        </p>
      </section>

      {/* Builder — client boundary.
          Suspense wraps the client component because nuqs (useSearchParams)
          forces CSR bailout during static prerendering. The fallback is a
          static shell that matches the final layout to avoid layout shift.
          aria-labelledby points at the h2 rendered inside ReactorBuilderView. */}
      <section
        aria-labelledby="builder-title"
        className="mx-auto max-w-[var(--container-max)] px-[var(--spacing-4)] sm:px-[var(--spacing-6)] pb-[var(--spacing-16)] sm:pb-[var(--spacing-24)]"
      >
        <Suspense fallback={<ReactorBuilderFallback />}>
          <ReactorBuilderView
            taxonomy={reactorTaxonomy}
            reactors={reactors}
          />
        </Suspense>
      </section>
    </main>
  );
}
