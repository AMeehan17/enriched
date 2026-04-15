import { Suspense } from "react";
import type { Metadata } from "next";
import { sources } from "@/data-src/sources";
import { presets } from "@/data-src/presets";
import { parseOgParams, buildCanonicalOgUrl } from "@/lib/og-params";
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
 * Dynamic rendering note:
 * generateMetadata reads searchParams so it can bake the right OG image URL
 * into the HTML meta tags for every shared /compare URL. This forces the
 * page into dynamic rendering (no more static prerender), which is the
 * acceptable price for the "rebuttal in a link" unfurl story — each preset
 * URL unfurls as its own distinct card on social platforms.
 */

const TITLE = "Compare Energy Sources — Enriched";
const DESCRIPTION =
  "Toggle energy sources on and off. Compare them across eight dimensions. Every number is sourced. Draw your own conclusions.";
const SITE_ORIGIN = "https://enriched-delta.vercel.app";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  // Flatten searchParams into URLSearchParams so parseOgParams can consume it.
  const sp = await searchParams;
  const flat = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") flat.set(k, v);
    else if (Array.isArray(v) && v[0]) flat.set(k, v[0]);
  }

  // If the URL params don't validate, fall back to the default OG state
  // (nuclear vs solar, current year, no preset). The actual page still
  // loads — it's nuqs's responsibility to handle the invalid URL, not the
  // meta tags.
  const parsed = parseOgParams(flat);
  const canonical = parsed.ok
    ? buildCanonicalOgUrl(SITE_ORIGIN, parsed.value)
    : `${SITE_ORIGIN}/og/compare`;

  // Build alt text. If a preset is active, lead with its title so the
  // screen-reader story matches the visual card.
  const presetObj = parsed.ok && parsed.value.preset
    ? presets.find((p) => p.slug === parsed.value.preset)
    : undefined;
  const ogAlt = presetObj
    ? `${presetObj.title} — Enriched energy source comparison`
    : "Compare energy sources across eight dimensions — Enriched";

  return {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: {
      title: presetObj?.title ?? TITLE,
      description: presetObj?.rhetoricalPoint ?? DESCRIPTION,
      url: `${SITE_ORIGIN}/compare`,
      siteName: "Enriched",
      images: [
        {
          url: canonical,
          width: 1200,
          height: 630,
          alt: ogAlt,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: presetObj?.title ?? TITLE,
      description: presetObj?.rhetoricalPoint ?? DESCRIPTION,
      images: [canonical],
    },
  };
}

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
    <main id="main-content" className="relative z-[1]">
      {/* Hero — labelled by its h1 so screen reader region nav announces
          it as "Compare energy sources across eight dimensions, region". */}
      <section
        aria-labelledby="page-title"
        className="mx-auto max-w-[var(--container-max)] px-[var(--spacing-4)] sm:px-[var(--spacing-6)] pt-[var(--spacing-8)] sm:pt-[var(--spacing-16)] pb-[var(--spacing-6)] sm:pb-[var(--spacing-8)]"
      >
        <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.1em] text-[var(--color-text-muted)] mb-[var(--spacing-3)]">
          {"// Module 01"}
        </p>
        <h1
          id="page-title"
          className="font-[family-name:var(--font-display)] text-[length:var(--text-2xl)] sm:text-[length:var(--text-3xl)] lg:text-[length:var(--text-4xl)] font-medium tracking-[-0.025em] leading-[1.05] mb-[var(--spacing-4)] sm:mb-[var(--spacing-6)] max-w-[900px]"
        >
          Compare energy sources across eight dimensions.
        </h1>
        <p className="font-[family-name:var(--font-body)] text-[length:var(--text-base)] sm:text-[length:var(--text-lg)] leading-[1.55] text-[var(--color-text-muted)] max-w-[640px]">
          Toggle sources on and off. Pick a baseline. Watch the years roll.
          Every number is sourced. Draw your own conclusions.
        </p>
      </section>

      {/* Comparison tool — client boundary.
          Suspense wraps the client component because nuqs (useSearchParams)
          forces CSR bailout during static prerendering. The fallback is a
          static shell that matches the final layout to avoid layout shift.
          aria-labelledby points at the h2 rendered inside ComparisonView. */}
      <section
        aria-labelledby="comparison-title"
        className="mx-auto max-w-[var(--container-max)] px-[var(--spacing-4)] sm:px-[var(--spacing-6)] pb-[var(--spacing-16)] sm:pb-[var(--spacing-24)]"
      >
        <Suspense fallback={<ComparisonViewFallback />}>
          <ComparisonView sources={sources} presets={presets} />
        </Suspense>
      </section>
    </main>
  );
}
