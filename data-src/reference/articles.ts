/**
 * Reference Library article manifest.
 *
 * Single source of truth for every published Module 3 article. The
 * manifest powers:
 *
 *   - <ArticleLink slug="..." /> — compile-time check that the slug
 *     exists (the slug prop is typed against ArticleSlug, the union
 *     derived from the `as const` array below)
 *   - scripts/validate-data.ts — walks every article's citations
 *     against the host allowlist and bibtex_key uniqueness rules
 *   - A future /reference index page (when article 2+ ships)
 *
 * Adding a new article = appending one entry here, after writing its
 * MDX + citations + cells + page route. The TypeScript types fan out
 * the change to every consumer.
 *
 * `sequence` is the curriculum order (1 = read first). It's used to
 * sort the future index page. Insert new articles between existing
 * ones by reassigning sequence numbers — they don't have to be unique
 * but order matters.
 */

import type { Citation } from "../../lib/data-types";
import { citations as fissionCitations } from "./fission.citations";
import { citations as spectrumCitations } from "./spectrum.citations";

export interface ReferenceArticle {
  /** URL slug — matches the route at /reference/<slug>. */
  slug: string;
  /** Display title for nav, index, and OG metadata. */
  title: string;
  /** Short dek (one sentence) shown on hover-cards and index entries. */
  dek: string;
  /** ISO YYYY-MM-DD; surfaced in metadata. */
  publishedDate: string;
  /** ISO YYYY-MM-DD; surfaced in metadata. */
  updatedDate: string;
  /** Curriculum order. 1 = the article a curious outsider should read first. */
  sequence: number;
  /** The per-article citations array (loaded from data-src/reference/<slug>.citations.ts). */
  citations: ReadonlyArray<Citation>;
}

export const REFERENCE_ARTICLES = [
  {
    slug: "fission",
    title: "Fission and the Chain Reaction",
    dek: "Every reactor needs a starter. What does that look like, and why?",
    publishedDate: "2026-06-18",
    updatedDate: "2026-06-18",
    sequence: 1,
    citations: fissionCitations,
  },
  {
    slug: "spectrum",
    title: "Spectrum: Thermal or Fast",
    dek: "Neutrons are born fast. Whether a reactor keeps them that way is a design choice.",
    publishedDate: "2026-06-18",
    updatedDate: "2026-06-18",
    sequence: 2,
    citations: spectrumCitations,
  },
] as const satisfies ReadonlyArray<ReferenceArticle>;

/** Union of every shipping article's slug. Compile-time safety for <ArticleLink>. */
export type ArticleSlug = (typeof REFERENCE_ARTICLES)[number]["slug"];

/** Indexed lookup — O(1) reads by slug. */
const BY_SLUG: ReadonlyMap<ArticleSlug, ReferenceArticle> = new Map(
  REFERENCE_ARTICLES.map((a) => [a.slug, a]),
);

export function getArticle(slug: ArticleSlug): ReferenceArticle {
  const a = BY_SLUG.get(slug);
  if (!a) {
    // Should never happen — slug is typed against the union.
    throw new Error(`Unknown article slug "${slug}"`);
  }
  return a;
}
