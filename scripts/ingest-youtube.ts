#!/usr/bin/env tsx
/**
 * ingest-youtube.ts — CLI wrapper over lib/resources-ingest.ts.
 *
 *   bun run ingest:youtube <url> [--id <slug>] [--speaker "Name"] [--tags a,b,c]
 *
 * Requires yt-dlp on PATH (`brew install yt-dlp`). The ingestion logic lives in
 * lib/ so the dev-only /library UI can reuse it.
 */
import { ingestYoutubeUrl, type YoutubeOpts } from "../lib/resources-ingest";

function parseArgs(argv: string[]): YoutubeOpts & { url?: string | undefined } {
  const out: YoutubeOpts & { url?: string | undefined } = {};
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === undefined) continue;
    if (a === "--id") out.id = argv[++i];
    else if (a === "--speaker") out.speaker = argv[++i];
    else if (a === "--tags")
      out.tags = (argv[++i] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    else rest.push(a);
  }
  out.url = rest[0];
  return out;
}

async function main(): Promise<void> {
  const { url, ...opts } = parseArgs(process.argv.slice(2));
  if (!url) {
    console.error('usage: bun run ingest:youtube <url> [--id slug] [--speaker "Name"] [--tags a,b,c]');
    process.exit(1);
  }
  try {
    const r = await ingestYoutubeUrl(url, opts);
    console.log(`✓ wrote ${r.file} (${r.words.toLocaleString()} words)`);
    console.log("✓ INDEX.md updated");
  } catch (e) {
    console.error(`ERROR: ${(e as Error).message}`);
    process.exit(1);
  }
}

main();
