/**
 * /reference/fission — Module 3, article 1.
 *
 * Renders content/reference/fission.mdx wrapped in a CitationsProvider
 * so <Cite> and <Bibliography> resolve against fission citations from
 * the article manifest. <ArticleLink> resolves against the manifest at
 * render time too — no client-side state on either.
 */

import type { Metadata } from "next";
import FissionArticle, {
  metadata as articleMetadata,
} from "@/content/reference/fission.mdx";
import { getArticle } from "@/data-src/reference/articles";
import { CitationsProvider } from "@/lib/cells/citations-context";

const article = getArticle("fission");

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

export default function FissionPage() {
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
          <FissionArticle />
        </CitationsProvider>
      </article>
    </main>
  );
}
