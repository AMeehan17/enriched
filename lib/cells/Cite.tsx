"use client";

/**
 * <Cite id="bibtex_key" />
 *
 * Renders a superscript footnote number in document position, linked to the
 * matching entry in <Bibliography /> at the article foot. Repeat references
 * to the same id render the same number.
 *
 * Missing-id behavior: renders a loud rust-accent error span. The error is
 * visible during dev/preview and impossible to miss in QA. The build will
 * still succeed; this is a render-time guarantee, not a build-time one.
 * (Build-time check is a follow-up — see scripts/validate-data.ts plans.)
 */

import { useCitation } from "./citations-context";

interface CiteProps {
  /** The bibtex_key of the citation to reference. Must match an entry in the article's citations array. */
  id: string;
}

export function Cite({ id }: CiteProps) {
  const entry = useCitation(id);

  if (!entry) {
    return (
      <span
        role="alert"
        title={`Citation '${id}' not found in this article's citations array.`}
        style={{
          color: "var(--color-accent-text)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        [cite:{id}?]
      </span>
    );
  }

  return (
    <sup style={{ lineHeight: 0 }}>
      <a
        href={`#cite-${entry.citation.bibtex_key}`}
        style={{
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7em",
          fontVariantNumeric: "tabular-nums",
          textDecoration: "none",
          paddingLeft: "1px",
        }}
        aria-label={`Citation ${entry.index}: ${entry.citation.title}`}
      >
        {entry.index}
      </a>
    </sup>
  );
}
