#!/usr/bin/env tsx
/**
 * build-resources-index.ts — CLI wrapper to regenerate EnergyKnowledgeBase/INDEX.md.
 *
 *   bun run build:index
 *
 * The logic lives in lib/resources-library.ts (shared with the /library UI).
 */
import { buildIndex } from "../lib/resources-library";

buildIndex()
  .then((r) => console.log(`✓ INDEX.md — ${r.count} sources (${r.talks} talks, ${r.reports} reports)`))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
