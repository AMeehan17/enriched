import { Suspense } from "react";
import { sources } from "@/data-src/sources";
import { presets } from "@/data-src/presets";
import { ComparisonView } from "./_components/ComparisonView";

/**
 * /compare — Module 1: Energy Source Comparison
 *
 * Server component. Reads typed data from data-src/ at build time and
 * passes it to the client component that owns the interactive state.
 *
 * Server/client boundary:
 *   - This file: server. Imports data, renders the shell, provides metadata.
 *   - ComparisonView: client. Owns nuqs URL state, renders pills/bars/slider.
 *
 * The data is passed as props, NOT fetched from /data/*.json. The JSON files
 * exist for external consumers; the React tree reads the typed source directly.
 */

export const metadata = {
  title: "Compare Energy Sources — Enriched",
  description:
    "Toggle energy sources on and off. Compare them across eight dimensions. Every number is sourced. Draw your own conclusions.",
};

/**
 * Fallback shown while the client component hydrates. Matches the final
 * layout's vertical rhythm so there's no layout shift between fallback
 * and hydrated state.
 */
function ComparisonViewFallback() {
  return (
    <div
      className="border-t border-[var(--color-rule-strong)] pt-[var(--spacing-6)] py-[var(--spacing-24)] text-center"
      aria-live="polite"
    >
      <p className="font-[family-name:var(--font-display)] text-[length:var(--text-sm)] text-[var(--color-text-faint)] uppercase tracking-[0.1em]">
        {"/ Loading comparison..."}
      </p>
    </div>
  );
}

export default function ComparePage() {
  return (
    <main className="relative z-[1]">
      {/* Hero */}
      <section className="mx-auto max-w-[var(--container-max)] px-[var(--spacing-6)] pt-[var(--spacing-16)] pb-[var(--spacing-8)]">
        <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.1em] text-[var(--color-text-muted)] mb-[var(--spacing-3)]">
          {"// Module 01"}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-[length:var(--text-4xl)] font-medium tracking-[-0.025em] leading-[1.05] mb-[var(--spacing-6)] max-w-[900px]">
          Compare energy sources across eight dimensions.
        </h1>
        <p className="font-[family-name:var(--font-body)] text-[length:var(--text-lg)] leading-[1.55] text-[var(--color-text-muted)] max-w-[640px]">
          Toggle sources on and off. Pick a baseline. Watch the years roll.
          Every number is sourced. Draw your own conclusions.
        </p>
      </section>

      {/* Comparison tool — client boundary.
          Suspense wraps the client component because nuqs (useSearchParams)
          forces CSR bailout during static prerendering. The fallback is a
          static shell that matches the final layout to avoid layout shift. */}
      <section className="mx-auto max-w-[var(--container-max)] px-[var(--spacing-6)] pb-[var(--spacing-24)]">
        <Suspense fallback={<ComparisonViewFallback />}>
          <ComparisonView sources={sources} presets={presets} />
        </Suspense>
      </section>
    </main>
  );
}
