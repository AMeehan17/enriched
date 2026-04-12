import type { Citation } from "./data-types";

/**
 * citation.ts — pure functions for generating BibTeX entries.
 *
 * No React, no DOM, no fetch. Trivially unit-testable.
 *
 * The bibtex_key pattern is {author}{year}{shortname}_{source-id} to guarantee
 * uniqueness across the dataset. The validator catches duplicate keys at
 * build time, so by the time we render them we know they're unique.
 */

/**
 * Escape a string for BibTeX field values. BibTeX's special characters
 * that must be escaped with a backslash: & % $ # _ { } ~ ^ \
 *
 * Backslash itself is escaped first (otherwise the replacement would
 * cascade). Newlines collapse to spaces to keep entries on sensible lines.
 */
function escapeBibTeX(value: string): string {
  return value
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([&%$#_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/\n/g, " ")
    .trim();
}

/**
 * Generate a BibTeX @misc entry from a citation object.
 *
 * Example output:
 *
 *   @misc{lazard2024lcoe_nuclear,
 *     author    = {Lazard},
 *     title     = {Levelized Cost of Energy Analysis, Nuclear (midpoint)},
 *     year      = {2024},
 *     version   = {v17.0},
 *     publisher = {Lazard Ltd.},
 *     url       = {https://www.lazard.com/research-insights/lcoe/},
 *     urldate   = {2026-04-09},
 *     note      = {Accessed via Enriched — open-source nuclear education}
 *   }
 */
export function generateBibTeX(citation: Citation): string {
  const lines: string[] = [];

  lines.push(`@misc{${citation.bibtex_key},`);
  lines.push(`  author    = {${escapeBibTeX(citation.author)}},`);
  lines.push(`  title     = {${escapeBibTeX(citation.title)}},`);
  lines.push(`  year      = {${citation.year}},`);

  if (citation.version) {
    lines.push(`  version   = {${escapeBibTeX(citation.version)}},`);
  }
  if (citation.publisher) {
    lines.push(`  publisher = {${escapeBibTeX(citation.publisher)}},`);
  }

  lines.push(`  url       = {${citation.url}},`);
  lines.push(`  urldate   = {${citation.accessed}},`);
  lines.push(`  note      = {Accessed via Enriched — open-source nuclear education}`);
  lines.push(`}`);

  return lines.join("\n");
}

/**
 * Generate a clipboard-friendly plain-text citation (APA-lite style).
 * Used as the copy fallback when clipboard API isn't available.
 */
export function generatePlainCitation(citation: Citation): string {
  const parts: string[] = [];
  parts.push(`${citation.author} (${citation.year}).`);
  parts.push(`${citation.title}.`);
  if (citation.version) parts.push(`${citation.version}.`);
  if (citation.publisher) parts.push(citation.publisher + ".");
  parts.push(`Retrieved ${citation.accessed} from ${citation.url}`);
  return parts.join(" ");
}
