"use client";

/**
 * <Bibliography />
 *
 * Renders the full citation list at the foot of a reference article.
 * Reads from <CitationsProvider> context — no props needed.
 *
 * Numbered in the same order as <Cite> footnote references. Each entry
 * is the click-target for the matching superscript number via its
 * `id="cite-{bibtex_key}"` anchor.
 *
 * DESIGN.md compliance: hairline rule between entries, tabular-nums on
 * the number, JetBrains Mono for the bibtex_key, Instrument Sans body
 * for the citation text. No icons.
 */

import { useAllCitations } from "./citations-context";
import { generatePlainCitation } from "../citation";

export function Bibliography() {
  const entries = useAllCitations();

  if (entries.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="bibliography-heading"
      style={{
        marginTop: "var(--spacing-16)",
        paddingTop: "var(--spacing-8)",
        borderTop: "1px solid var(--color-rule-strong)",
      }}
    >
      <h2
        id="bibliography-heading"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-sm)",
          fontWeight: 500,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: "var(--spacing-6)",
        }}
      >
        Citations
      </h2>
      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {entries.map((entry) => (
          <li
            key={entry.citation.bibtex_key}
            id={`cite-${entry.citation.bibtex_key}`}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "var(--spacing-3)",
              paddingTop: "var(--spacing-4)",
              paddingBottom: "var(--spacing-4)",
              borderTop:
                entry.index === 1 ? "none" : "1px solid var(--color-rule)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text)",
              lineHeight: 1.5,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                fontVariantNumeric: "tabular-nums",
                color: "var(--color-text-muted)",
                paddingTop: "2px",
              }}
              aria-hidden="true"
            >
              {entry.index}.
            </span>
            <div>
              <span>{generatePlainCitation(entry.citation)}</span>
              {entry.citation.note ? (
                <span
                  style={{
                    display: "block",
                    marginTop: "var(--spacing-1)",
                    color: "var(--color-text-faint)",
                    fontSize: "var(--text-xs)",
                  }}
                >
                  {entry.citation.note}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
