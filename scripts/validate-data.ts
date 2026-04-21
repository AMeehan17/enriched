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
import { reactorTaxonomy } from "../data-src/reactor-taxonomy";
import { reactors } from "../data-src/reactors";
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
import {
  FUEL_MATERIAL_IDS,
  KICKSTARTER_IDS,
  FUEL_FORM_IDS,
  COOLANT_IDS,
  X_FACTOR_IDS,
  REACTOR_TYPES,
  REACTOR_PLAUSIBILITY_BOUNDS,
  type TaxonomyTag,
} from "../lib/reactor-types";
import { isAllowedCitationHost } from "../lib/citation-allowlist";

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
  if (!/^[a-z0-9_-]+$/.test(c.bibtex_key)) {
    err(
      `${path}.bibtex_key`,
      `must match /^[a-z0-9_-]+$/, got "${c.bibtex_key}"`,
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

  // Module 1: sources
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

  // Module 2: taxonomy tags (schema v2: fissile + kickstarter + form + coolant + x-factor)
  const {
    fuelMaterialTags,
    kickstarterTags,
    fuelFormTags,
    coolantTags,
    xFactorTags,
  } = reactorTaxonomy;
  const allTags = [
    ...fuelMaterialTags.map((t, i) => ({
      tag: t,
      path: `taxonomy.fuelMaterial[${i}]`,
    })),
    ...kickstarterTags.map((t, i) => ({
      tag: t,
      path: `taxonomy.kickstarter[${i}]`,
    })),
    ...fuelFormTags.map((t, i) => ({
      tag: t,
      path: `taxonomy.fuelForm[${i}]`,
    })),
    ...coolantTags.map((t, i) => ({ tag: t, path: `taxonomy.coolant[${i}]` })),
    ...xFactorTags.map((t, i) => ({ tag: t, path: `taxonomy.xFactor[${i}]` })),
  ];
  for (const { tag, path } of allTags) {
    for (const [ci, c] of tag.citations.entries()) {
      if (c.bibtex_key) {
        check(c.bibtex_key, `${path}.citations[${ci}]`);
      }
    }
  }

  // Module 2: reactor designs
  for (const [ri, r] of reactors.entries()) {
    for (const [ci, c] of r.citations.entries()) {
      if (c.bibtex_key) {
        check(c.bibtex_key, `reactors[${ri}].citations[${ci}]`);
      }
    }
  }
}

// ─── Module 2: Reactor taxonomy validation ──────────────────────────

function validateTaxonomyTag(
  path: string,
  tag: TaxonomyTag,
  validIds: readonly string[],
): void {
  if (!validIds.includes(tag.id)) {
    err(`${path}.id`, `unknown tag ID "${tag.id}"`);
  }
  if (!tag.label) err(`${path}.label`, "missing");
  if (!tag.oneLineHook) {
    err(`${path}.oneLineHook`, "missing");
  } else if (tag.oneLineHook.length > 160) {
    err(
      `${path}.oneLineHook`,
      `exceeds 160 chars (got ${tag.oneLineHook.length})`,
    );
  }
  if (!tag.popoverBody) err(`${path}.popoverBody`, "missing");
  if (!tag.citations || tag.citations.length === 0) {
    err(`${path}.citations`, "must have ≥1 citation");
  } else {
    for (const [i, c] of tag.citations.entries()) {
      validateCitation(`${path}.citations[${i}]`, c);
      // Allowlist check
      if (c.url && !isAllowedCitationHost(c.url)) {
        err(
          `${path}.citations[${i}].url`,
          `host not in citation allowlist: "${c.url}"`,
        );
      }
    }
  }
}

function validateTaxonomy(): void {
  const {
    fuelMaterialTags,
    kickstarterTags,
    fuelFormTags,
    coolantTags,
    xFactorTags,
  } = reactorTaxonomy;

  // Generic validator for a taxonomy dimension: check every tag, dedupe IDs,
  // and verify every valid ID has a tag.
  function validateDimension(
    label: string,
    tags: ReadonlyArray<TaxonomyTag>,
    validIds: readonly string[],
  ): void {
    const idSet = new Set<string>();
    for (const [i, tag] of tags.entries()) {
      validateTaxonomyTag(`taxonomy.${label}[${i}]`, tag, validIds);
      if (idSet.has(tag.id)) {
        err(
          `taxonomy.${label}[${i}].id`,
          `duplicate ${label} tag ID "${tag.id}"`,
        );
      }
      idSet.add(tag.id);
    }
    for (const id of validIds) {
      if (!idSet.has(id)) {
        err(`taxonomy.${label}`, `missing tag for ID "${id}"`);
      }
    }
  }

  validateDimension("fuelMaterial", fuelMaterialTags, [...FUEL_MATERIAL_IDS]);
  validateDimension("kickstarter", kickstarterTags, [...KICKSTARTER_IDS]);
  validateDimension("fuelForm", fuelFormTags, [...FUEL_FORM_IDS]);
  validateDimension("coolant", coolantTags, [...COOLANT_IDS]);

  // X-Factor has additional group validation
  const xIdSet = new Set<string>();
  for (const [i, tag] of xFactorTags.entries()) {
    validateTaxonomyTag(`taxonomy.xFactor[${i}]`, tag, [...X_FACTOR_IDS]);
    if (xIdSet.has(tag.id)) {
      err(`taxonomy.xFactor[${i}].id`, `duplicate X-Factor tag ID "${tag.id}"`);
    }
    xIdSet.add(tag.id);
    if (!tag.group || !["scale", "capability"].includes(tag.group)) {
      err(
        `taxonomy.xFactor[${i}].group`,
        `must be "scale" or "capability", got "${tag.group}"`,
      );
    }
  }
  for (const id of X_FACTOR_IDS) {
    if (!xIdSet.has(id)) {
      err("taxonomy.xFactor", `missing tag for X-Factor ID "${id}"`);
    }
  }
}

// ─── Module 2: Reactor design validation ────────────────────────────

function validateReactors(): void {
  const fissileSet = new Set<string>(FUEL_MATERIAL_IDS);
  const kickstarterSet = new Set<string>(KICKSTARTER_IDS);
  const fuelFormSet = new Set<string>(FUEL_FORM_IDS);
  const coolantSet = new Set<string>(COOLANT_IDS);
  const xSet = new Set<string>(X_FACTOR_IDS);
  const reactorTypeSet = new Set<string>(REACTOR_TYPES);
  const idSet = new Set<string>();
  const { outletTempC: tempBounds } = REACTOR_PLAUSIBILITY_BOUNDS;

  if (reactors.length === 0) {
    err("reactors", "must have ≥1 reactor design");
  }

  for (const [i, r] of reactors.entries()) {
    const path = `reactors[${i}] (${r.id})`;

    // ID uniqueness
    if (idSet.has(r.id)) {
      err(`${path}.id`, `duplicate reactor ID "${r.id}"`);
    }
    idSet.add(r.id);

    if (!r.name) err(`${path}.name`, "missing");
    if (!r.description) err(`${path}.description`, "missing");

    // pursuedBy
    if (!r.pursuedBy || r.pursuedBy.length === 0) {
      err(`${path}.pursuedBy`, "must have ≥1 entry");
    } else {
      for (const [pi, p] of r.pursuedBy.entries()) {
        if (!p.name) err(`${path}.pursuedBy[${pi}].name`, "missing");
        if (!p.url || !p.url.startsWith("http")) {
          err(`${path}.pursuedBy[${pi}].url`, `missing or invalid`);
        } else if (!isAllowedCitationHost(p.url)) {
          err(
            `${path}.pursuedBy[${pi}].url`,
            `host not in citation allowlist: "${p.url}"`,
          );
        }
      }
    }

    // Fuel dimension (schema v2)
    if (!fissileSet.has(r.fuelMaterial)) {
      err(`${path}.fuelMaterial`, `unknown fissile element "${r.fuelMaterial}"`);
    }
    if (!fuelFormSet.has(r.fuelForm)) {
      err(`${path}.fuelForm`, `unknown fuel form "${r.fuelForm}"`);
    }
    // Kickstarter coupling: required when fuelMaterial is "th-232", forbidden otherwise
    if (r.fuelMaterial === "th-232") {
      if (!r.kickstarter) {
        err(
          `${path}.kickstarter`,
          "required when fuelMaterial is 'th-232' (thorium needs a fissile kickstarter)",
        );
      } else if (!kickstarterSet.has(r.kickstarter)) {
        err(`${path}.kickstarter`, `unknown kickstarter "${r.kickstarter}"`);
      }
    } else if (r.kickstarter) {
      err(
        `${path}.kickstarter`,
        `kickstarter only allowed when fuelMaterial is 'th-232', got fuelMaterial='${r.fuelMaterial}'`,
      );
    }
    // Coolant coupling: fuelForm = 'molten-salt' restricts coolants to salt chemistries
    const SALT_COOLANTS = new Set(["flibe", "flinak", "chloride-salt"]);
    if (r.fuelForm === "molten-salt") {
      for (const c of r.coolantTags) {
        if (!SALT_COOLANTS.has(c)) {
          err(
            `${path}.coolantTags`,
            `coolant '${c}' not allowed with fuelForm='molten-salt' (fuel is dissolved in salt, so coolant must be a salt chemistry)`,
          );
        }
      }
    }
    // Coolant tag validity
    for (const t of r.coolantTags) {
      if (!coolantSet.has(t))
        err(`${path}.coolantTags`, `unknown coolant tag "${t}"`);
    }
    // X-Factor tag validity
    for (const t of r.xFactorTags) {
      if (!xSet.has(t))
        err(`${path}.xFactorTags`, `unknown X-Factor tag "${t}"`);
    }
    // Reactor type
    if (!reactorTypeSet.has(r.reactorType)) {
      err(`${path}.reactorType`, `unknown reactor type "${r.reactorType}"`);
    }

    // Plausibility
    if (
      typeof r.outletTempC !== "number" ||
      r.outletTempC < tempBounds.min ||
      r.outletTempC > tempBounds.max
    ) {
      err(
        `${path}.outletTempC`,
        `out of bounds [${tempBounds.min}, ${tempBounds.max}], got ${r.outletTempC}`,
      );
    }

    // Spectrum
    if (!["thermal", "fast", "epithermal"].includes(r.spectrum)) {
      err(`${path}.spectrum`, `invalid: "${r.spectrum}"`);
    }

    // Why chain
    if (!r.whyChain || r.whyChain.length === 0) {
      err(`${path}.whyChain`, "must have ≥1 step");
    } else {
      for (const [si, step] of r.whyChain.entries()) {
        if (!step.text)
          err(`${path}.whyChain[${si}].text`, "missing");
        // tagRef validity (optional field — can reference any dimension)
        if (step.tagRef) {
          const valid =
            fissileSet.has(step.tagRef) ||
            kickstarterSet.has(step.tagRef) ||
            fuelFormSet.has(step.tagRef) ||
            coolantSet.has(step.tagRef) ||
            xSet.has(step.tagRef);
          if (!valid) {
            err(
              `${path}.whyChain[${si}].tagRef`,
              `unknown tag "${step.tagRef}"`,
            );
          }
        }
      }
    }

    // Citations
    if (!r.citations || r.citations.length === 0) {
      err(`${path}.citations`, "must have ≥1 citation");
    } else {
      for (const [ci, c] of r.citations.entries()) {
        validateCitation(`${path}.citations[${ci}]`, c);
        if (c.url && !isAllowedCitationHost(c.url)) {
          err(
            `${path}.citations[${ci}].url`,
            `host not in citation allowlist: "${c.url}"`,
          );
        }
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

  console.log("→ Validating data-src/reactor-taxonomy.ts");
  validateTaxonomy();

  console.log("→ Validating data-src/reactors.ts");
  validateReactors();

  if (errors.length > 0) {
    console.error(`\n✗ Validation failed with ${errors.length} error(s):\n`);
    for (const e of errors) console.error(e);
    console.error(
      "\nFix these in data-src/ and rerun. The validator runs in CI before next build, so bad data never ships.",
    );
    throw new ValidationError(`${errors.length} validation error(s)`);
  }

  const {
    fuelMaterialTags: ft,
    kickstarterTags: kt,
    fuelFormTags: ffT,
    coolantTags: ct,
    xFactorTags: xt,
  } = reactorTaxonomy;
  const tagCount = ft.length + kt.length + ffT.length + ct.length + xt.length;
  console.log(
    `\n✓ Validation passed: ${sources.length} sources, ${presets.length} presets, ${tagCount} taxonomy tags, ${reactors.length} reactor designs, all citations unique and within plausibility bounds.`,
  );
}

main();
