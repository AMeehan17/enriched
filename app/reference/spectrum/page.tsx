/**
 * /reference/spectrum — Module 3, article 1.
 *
 * Renders the MDX article from content/reference/spectrum.mdx, wrapped in
 * a CitationsProvider so <Cite> and <Bibliography> can resolve against
 * the per-article citations array. Cells (slider, plots) live as MDX
 * components registered globally in mdx-components.tsx.
 *
 * Server Component — the MDX content renders server-side; the citations
 * provider is the only client island in the article tree.
 */

import type { Metadata } from "next";
import SpectrumArticle, {
  metadata as articleMetadata,
} from "@/content/reference/spectrum.mdx";
import { getArticle } from "@/data-src/reference/articles";
import { CitationsProvider } from "@/lib/cells/citations-context";

const article = getArticle("spectrum");

export const metadata: Metadata = {
  title: `${articleMetadata.title} — Enriched`,
  description: articleMetadata.description,
  openGraph: {
    title: `${articleMetadata.title} — Enriched`,
    description: articleMetadata.description,
    type: "article",
    publishedTime: articleMetadata.publishedDate,
    modifiedTime: articleMetadata.updatedDate,
  },
  twitter: {
    card: "summary_large_image",
    title: `${articleMetadata.title} — Enriched`,
    description: articleMetadata.description,
  },
};

export default function SpectrumPage() {
  return (
    <main id="main-content">
      <article
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "var(--spacing-16) var(--spacing-6) var(--spacing-24)",
        }}
      >
        <CitationsProvider citations={article.citations}>
          <SpectrumArticle />
        </CitationsProvider>
      </article>
    </main>
  );
}
