#!/usr/bin/env tsx
/**
 * validate-data.ts — runtime validator for data-src/sources.ts and data-src/presets.ts.
 *
 * Runs as `bun run validate-data` (CLI), as part of `bun run build:data`
 * (build pipeline), and as a separate CI step BEFORE `next build`. Catches
 * data errors at the earliest possible moment.
 *
 * Validates:
 *   1. Schema compliance — every required field present
 *   2. BibTeX key uniqueness across the entire dataset
 *   3. Citation completeness — all required citation fields filled
 *   4. Source/preset reference integrity — presets reference valid IDs
 *   5. Plausibility bounds — values within sane ranges (catches typo/unit errors)
 *
 * Failure mode: throws on first error with the field path and the value.
 * Build fails. CI fails. The bad data never reaches production.
 */

import { sources } from "../data-src/sources";
import { presets } from "../data-src/presets";
import {
  ALL_DIMENSION_IDS,
  CATEGORICAL_DIMENSION_IDS,
  NUMERIC_DIMENSION_IDS,
  PLAUSIBILITY_BOUNDS,
  SOURCE_IDS,
  type Citation,
  type DimensionId,
  type Source,
} from "../lib/data-types";

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const errors: string[] = [];

function err(path: string, message: string): void {
  errors.push(`  ${path}: ${message}`);
}

function validateCitation(path: string, c: Citation): void {
  if (!c.bibtex_key) err(`${path}.bibtex_key`, "missing");
  if (!/^[a-z0-9_]+$/.test(c.bibtex_key)) {
    err(
      `${path}.bibtex_key`,
      `must match /^[a-z0-9_]+$/, got "${c.bibtex_key}"`,
    );
  }
  if (!c.author) err(`${path}.author`, "missing");
  if (!c.title) err(`${path}.title`, "missing");
  if (typeof c.year !== "number" || c.year < 1900 || c.year > 2100) {
    err(`${path}.year`, `out of range, got ${c.year}`);
  }
  if (!c.url || !c.url.startsWith("http")) {
    err(`${path}.url`, `missing or invalid, got "${c.url}"`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.accessed)) {
    err(
      `${path}.accessed`,
      `must be ISO date YYYY-MM-DD, got "${c.accessed}"`,
    );
  }
}

function validateSource(source: Source): void {
  const path = `sources.${source.id}`;

  if (!SOURCE_IDS.includes(source.id)) {
    err(`${path}.id`, `unknown source ID "${source.id}"`);
  }
  if (!source.label) err(`${path}.label`, "missing");

  // Numeric dimensions
  for (const dimId of NUMERIC_DIMENSION_IDS) {
    const dim = source[dimId];
    const dimPath = `${path}.${dimId}`;
    if (!dim) {
      err(dimPath, "missing");
      continue;
    }
    if (typeof dim.value !== "number" || Number.isNaN(dim.value)) {
      err(`${dimPath}.value`, `must be a number, got ${dim.value}`);
    }
    if (!dim.unit) err(`${dimPath}.unit`, "missing");
    if (!dim.citation) {
      err(`${dimPath}.citation`, "missing");
    } else {
      validateCitation(`${dimPath}.citation`, dim.citation);
    }

    // Plausibility bounds
    const bounds = PLAUSIBILITY_BOUNDS[dimId];
    if (bounds && typeof dim.value === "number") {
      if (dim.value < bounds.min || dim.value > bounds.max) {
        err(
          `${dimPath}.value`,
          `out of plausibility bounds [${bounds.min}, ${bounds.max}], got ${dim.value}`,
        );
      }
    }

    // History entries (if present) must also be plausible
    if (dim.history) {
      for (const [i, entry] of dim.history.entries()) {
        const entryPath = `${dimPath}.history[${i}]`;
        if (typeof entry.year !== "number") {
          err(`${entryPath}.year`, "missing");
        }
        if (typeof entry.value !== "number") {
          err(`${entryPath}.value`, "missing");
        } else if (
          bounds &&
          (entry.value < bounds.min || entry.value > bounds.max)
        ) {
          err(
            `${entryPath}.value`,
            `out of plausibility bounds, got ${entry.value}`,
          );
        }
        if (entry.citation) {
          validateCitation(`${entryPath}.citation`, entry.citation);
        }
      }
    }
  }

  // Categorical dimensions
  for (const dimId of CATEGORICAL_DIMENSION_IDS) {
    const dim = source[dimId];
    const dimPath = `${path}.${dimId}`;
    if (!dim) {
      err(dimPath, "missing");
      continue;
    }
    if (!dim.category) err(`${dimPath}.category`, "missing");
    if (!dim.label) err(`${dimPath}.label`, "missing");
    if (!dim.citation) {
      err(`${dimPath}.citation`, "missing");
    } else {
      validateCitation(`${dimPath}.citation`, dim.citation);
    }
  }
}

function validateBibKeyUniqueness(): void {
  const seen = new Map<string, string>(); // key → first occurrence path

  function check(key: string, path: string): void {
    const prior = seen.get(key);
    if (prior) {
      err(
        path,
        `duplicate bibtex_key "${key}", first seen at ${prior}. Pattern must be {author}{year}{shortname}_{source-id}.`,
      );
    } else {
      seen.set(key, path);
    }
  }

  for (const source of sources) {
    for (const dimId of NUMERIC_DIMENSION_IDS) {
      const dim = source[dimId];
      if (dim?.citation?.bibtex_key) {
        check(dim.citation.bibtex_key, `sources.${source.id}.${dimId}.citation`);
      }
      if (dim?.history) {
        for (const [i, entry] of dim.history.entries()) {
          if (entry.citation?.bibtex_key) {
            check(
              entry.citation.bibtex_key,
              `sources.${source.id}.${dimId}.history[${i}].citation`,
            );
          }
        }
      }
    }
    for (const dimId of CATEGORICAL_DIMENSION_IDS) {
      const dim = source[dimId];
      if (dim?.citation?.bibtex_key) {
        check(dim.citation.bibtex_key, `sources.${source.id}.${dimId}.citation`);
      }
    }
  }
}

function validatePresetReferences(): void {
  const sourceIdSet = new Set(SOURCE_IDS);
  const dimIdSet = new Set<DimensionId>(ALL_DIMENSION_IDS);

  for (const preset of presets) {
    const path = `presets.${preset.slug}`;
    if (!preset.slug) err(`${path}.slug`, "missing");
    if (!preset.title) err(`${path}.title`, "missing");
    if (!preset.description) err(`${path}.description`, "missing");
    if (!preset.rhetoricalPoint) err(`${path}.rhetoricalPoint`, "missing");

    for (const sid of preset.sources) {
      if (!sourceIdSet.has(sid)) {
        err(`${path}.sources`, `unknown source ID "${sid}"`);
      }
    }
    if (preset.normalize !== "none" && !sourceIdSet.has(preset.normalize)) {
      err(
        `${path}.normalize`,
        `unknown source ID "${preset.normalize}" (must be a source ID or "none")`,
      );
    }
    for (const did of preset.highlightedDimensions) {
      if (!dimIdSet.has(did)) {
        err(`${path}.highlightedDimensions`, `unknown dimension ID "${did}"`);
      }
    }
    if (preset.year < 2010 || preset.year > 2026) {
      err(`${path}.year`, `out of range, got ${preset.year}`);
    }
  }

  // Slug uniqueness across presets
  const slugs = new Map<string, number>();
  for (const [i, preset] of presets.entries()) {
    if (slugs.has(preset.slug)) {
      err(
        `presets[${i}].slug`,
        `duplicate slug "${preset.slug}", first seen at presets[${slugs.get(preset.slug)}]`,
      );
    } else {
      slugs.set(preset.slug, i);
    }
  }
}

function main(): void {
  console.log("→ Validating data-src/sources.ts");
  for (const source of sources) {
    validateSource(source);
  }

  console.log("→ Validating bibtex_key uniqueness");
  validateBibKeyUniqueness();

  console.log("→ Validating data-src/presets.ts");
  validatePresetReferences();

  if (errors.length > 0) {
    console.error(`\n✗ Validation failed with ${errors.length} error(s):\n`);
    for (const e of errors) console.error(e);
    console.error(
      "\nFix these in data-src/ and rerun. The validator runs in CI before next build, so bad data never ships.",
    );
    throw new ValidationError(`${errors.length} validation error(s)`);
  }

  console.log(
    `\n✓ Validation passed: ${sources.length} sources, ${presets.length} presets, all citations unique and within plausibility bounds.`,
  );
}

main();
