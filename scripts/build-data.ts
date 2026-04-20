#!/usr/bin/env tsx
/**
 * build-data.ts — compiles data-src/*.ts to public/data/*.json.
 *
 * Runs validation first (so a failing validator blocks the build), then
 * writes the JSON files that external consumers fetch via stable URLs.
 *
 *   data-src/sources.ts ──┐
 *                         ├── validator ──▶ public/data/sources.json
 *   data-src/presets.ts ──┘                public/data/presets.json
 *
 * Both JSON files include `lastUpdated` (ISO timestamp) and
 * `schemaVersion` (1) for future migration.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

// Run validation first. The validator throws on failure, which kills the
// build before we write any JSON. This is the schema-first build order
// the eng review locked in.
import "./validate-data";

import { sources } from "../data-src/sources";
import { presets } from "../data-src/presets";
import { reactorTaxonomy } from "../data-src/reactor-taxonomy";
import { reactors } from "../data-src/reactors";
import type { PresetsJson, SourcesJson } from "../lib/data-types";
import type { TaxonomyJson, ReactorsJson } from "../lib/reactor-types";

const outputDir = resolve(import.meta.dirname, "..", "public", "data");
const sourcesPath = resolve(outputDir, "sources.json");
const presetsPath = resolve(outputDir, "presets.json");
const taxonomyPath = resolve(outputDir, "taxonomy.json");
const reactorsPath = resolve(outputDir, "reactors.json");

async function ensureDir(path: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
}

async function writeJson(path: string, data: unknown): Promise<void> {
  await ensureDir(path);
  const formatted = JSON.stringify(data, null, 2) + "\n";
  await writeFile(path, formatted, "utf-8");
}

async function main(): Promise<void> {
  const lastUpdated = new Date().toISOString();

  const sourcesJson: SourcesJson = {
    lastUpdated,
    schemaVersion: 1,
    sources,
  };

  const presetsJson: PresetsJson = {
    lastUpdated,
    schemaVersion: 1,
    presets,
  };

  const taxonomyJson: TaxonomyJson = {
    lastUpdated,
    schemaVersion: 2,
    fissileElement: reactorTaxonomy.fissileElementTags,
    kickstarter: reactorTaxonomy.kickstarterTags,
    fuelForm: reactorTaxonomy.fuelFormTags,
    coolant: reactorTaxonomy.coolantTags,
    xFactor: reactorTaxonomy.xFactorTags,
  };

  const reactorsJson: ReactorsJson = {
    lastUpdated,
    schemaVersion: 2,
    reactors,
  };

  await writeJson(sourcesPath, sourcesJson);
  await writeJson(presetsPath, presetsJson);
  await writeJson(taxonomyPath, taxonomyJson);
  await writeJson(reactorsPath, reactorsJson);

  console.log(`→ Wrote ${sourcesPath}`);
  console.log(`→ Wrote ${presetsPath}`);
  console.log(`→ Wrote ${taxonomyPath}`);
  console.log(`→ Wrote ${reactorsPath}`);
  console.log("\n✓ Data build complete.");
}

main().catch((error) => {
  console.error("✗ Data build failed:", error);
  process.exit(1);
});
