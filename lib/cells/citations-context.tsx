"use client";

/**
 * Per-article citations context.
 *
 * The reference article's page component loads its citations array
 * (e.g., `data-src/reference/spectrum.citations.ts`) and wraps the
 * MDX body in <CitationsProvider citations={...}>. <Cite> and
 * <Bibliography> read from this context.
 *
 * Footnote numbering is the citation's index in the array (1-based).
 * Author orders the array; the component does not auto-detect document
 * order. This keeps SSR deterministic and keeps the citation file
 * itself self-documenting.
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Citation } from "../data-types";

export interface CitationEntry {
  citation: Citation;
  /** 1-based footnote number, matches array index + 1. */
  index: number;
}

interface CitationsValue {
  /** Lookup by bibtex_key — O(1). */
  byKey: ReadonlyMap<string, CitationEntry>;
  /** Pre-sorted by index. <Bibliography> reads this directly. */
  ordered: ReadonlyArray<CitationEntry>;
}

const CitationsContext = createContext<CitationsValue | null>(null);

export function CitationsProvider({
  citations,
  children,
}: {
  citations: ReadonlyArray<Citation>;
  children: ReactNode;
}) {
  const value = useMemo<CitationsValue>(() => {
    const ordered: CitationEntry[] = citations.map((citation, i) => ({
      citation,
      index: i + 1,
    }));
    const byKey = new Map<string, CitationEntry>();
    ordered.forEach((entry) => {
      byKey.set(entry.citation.bibtex_key, entry);
    });
    return { byKey, ordered };
  }, [citations]);

  return (
    <CitationsContext.Provider value={value}>
      {children}
    </CitationsContext.Provider>
  );
}

/**
 * Look up a citation by bibtex_key. Returns undefined if the key is not in
 * the current article's citations.
 */
export function useCitation(bibtex_key: string): CitationEntry | undefined {
  const ctx = useContext(CitationsContext);
  return ctx?.byKey.get(bibtex_key);
}

/**
 * Return all citations for the current article, ordered by their footnote
 * number. Used by <Bibliography>. Returns an empty array when no provider
 * is mounted (defensive — keeps the bibliography from crashing).
 */
export function useAllCitations(): ReadonlyArray<CitationEntry> {
  const ctx = useContext(CitationsContext);
  return ctx?.ordered ?? [];
}
