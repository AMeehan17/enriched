/**
 * <ArticleLink slug="fission">optional override text</ArticleLink>
 *
 * Inline cross-reference between Reference Library articles. Reads from
 * data-src/reference/articles.ts so the slug prop is typed against the
 * union of every shipping article — unknown slugs fail at TypeScript
 * compile time, which is the build-time guarantee we wanted from this
 * pattern.
 *
 * Default rendered text is the target article's title. Pass children to
 * override (e.g. "fissioning" linked to the fission article).
 *
 * Styled to read as inline prose: thin rule under the text rendered in
 * --color-rule-strong, hover swaps to the accent. No icons.
 *
 * Server Component — no state, no client hooks. The link can render
 * inside MDX (server-rendered) without a "use client" boundary.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { getArticle, type ArticleSlug } from "@/data-src/reference/articles";

interface ArticleLinkProps {
  /** Slug of the target article. Typed — unknown slugs fail to compile. */
  slug: ArticleSlug;
  /** Override text. Defaults to the article's title. */
  children?: ReactNode;
}

export function ArticleLink({ slug, children }: ArticleLinkProps) {
  const article = getArticle(slug);
  return (
    <Link
      href={`/reference/${article.slug}`}
      title={article.dek}
      style={{
        color: "var(--color-text)",
        textDecoration: "underline",
        textDecorationColor: "var(--color-rule-strong)",
        textUnderlineOffset: "3px",
        textDecorationThickness: "1px",
      }}
    >
      {children ?? article.title}
    </Link>
  );
}
