#!/usr/bin/env tsx
/**
 * ingest-pdf.ts — CLI wrapper over lib/resources-ingest.ts.
 *
 *   bun run ingest:pdf <path> --publisher "Lazard" [--title "..."] \
 *     [--url <public-url>] [--date YYYY-MM-DD] [--id <slug>] [--tags a,b]
 *
 * Requires pdftotext (poppler): `brew install poppler`.
 */
import { ingestPdfFile, type PdfOpts } from "../lib/resources-ingest";

type PdfArgs = { [K in keyof PdfOpts]?: PdfOpts[K] | undefined } & {
  path?: string | undefined;
};

function parseArgs(argv: string[]): PdfArgs {
  const out: PdfArgs = {};
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === undefined) continue;
    if (a === "--publisher") out.publisher = argv[++i];
    else if (a === "--title") out.title = argv[++i];
    else if (a === "--url") out.url = argv[++i];
    else if (a === "--date") out.date = argv[++i];
    else if (a === "--id") out.id = argv[++i];
    else if (a === "--tags")
      out.tags = (argv[++i] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    else rest.push(a);
  }
  out.path = rest[0];
  return out;
}

async function main(): Promise<void> {
  const { path, ...opts } = parseArgs(process.argv.slice(2));
  if (!path) {
    console.error('usage: bun run ingest:pdf <path> --publisher "Name" [--title ..] [--url ..] [--date YYYY-MM-DD] [--tags a,b]');
    process.exit(1);
  }
  if (!opts.publisher) {
    console.error("ERROR: --publisher is required for reports.");
    process.exit(1);
  }
  if (!opts.url) {
    console.warn("⚠ no --url given; source_url will be the local path. Add the public URL for a clean citation.");
  }
  try {
    const r = await ingestPdfFile(path, opts as PdfOpts);
    console.log(`✓ wrote ${r.file} (${r.words.toLocaleString()} words)`);
    console.log("✓ INDEX.md updated");
  } catch (e) {
    console.error(`ERROR: ${(e as Error).message}`);
    process.exit(1);
  }
}

main();
