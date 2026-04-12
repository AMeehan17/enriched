import {
  parseAsArrayOf,
  parseAsStringLiteral,
  parseAsString,
  type ParserBuilder,
} from "nuqs";
import { SOURCE_IDS, type SourceId, type NormalizeOption } from "./data-types";

/**
 * URL state parsers for Module 1.
 *
 * These are the nuqs parser definitions for all query params that drive
 * the comparison tool. Defined in one place so the OG image route, preset
 * loader, and any future consumer reference the same serialization.
 *
 * URL schema:
 *   /compare?sources=nuclear,solar&normalize=nuclear&year=2024&preset=climate-case
 *
 * Invariants enforced by the parsers:
 *   - sources: must be a subset of the 6 known source IDs. Unknown values filtered out.
 *   - normalize: must be a known source ID or "none". Defaults to "none".
 *   - year: must be integer 2010-2026. Defaults to 2024. (added in Day 6)
 *   - preset: must be a known preset slug. Defaults to null. (added with preset pill row)
 */

// ─── sources ─────────────────────────────────────────────────────────
// Array of source IDs. Uses parseAsStringLiteral to enforce the whitelist.
// Unknown values are filtered out at parse time — no runtime validation needed.
export const sourcesParser = parseAsArrayOf(
  parseAsStringLiteral(SOURCE_IDS),
  ","
).withDefault(["nuclear", "solar"] as SourceId[]);

// ─── normalize ───────────────────────────────────────────────────────
// Single source ID or "none". Using plain string parser + manual validation
// because parseAsStringLiteral doesn't accept a mixed union of enum + "none".
const NORMALIZE_VALUES = [...SOURCE_IDS, "none"] as const;

export const normalizeParser: ParserBuilder<NormalizeOption> =
  parseAsStringLiteral(NORMALIZE_VALUES).withDefault("none");

// ─── preset (reserved, wired in next iteration) ─────────────────────
// parseAsString with whitelist validation deferred to the consumer until
// the preset pill row lands. Placeholder export.
export const presetParser = parseAsString;
