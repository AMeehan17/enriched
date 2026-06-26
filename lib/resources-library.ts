/**
 * resources-library.ts — server-only read layer over the gitignored
 * EnergyKnowledgeBase/ folder. Parses frontmatter into typed entries and
 * regenerates INDEX.md. Used by the CLI index builder and the dev-only
 * /library UI. Uses node:fs — never import from a client component.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { parse, type ResourceFrontmatter, type ResourceDoc } from "./resources-schema";

/** Repo-root-relative. CLI scripts and `next dev` both run with cwd = repo root.
 *  Lazy (not a module-load const) so cwd is resolved at call time.
 *
 *  NOTE: `next build` emits one benign Turbopack NFT warning because the dev-only
 *  /library route reads arbitrary files here (readdir/readFile on runtime paths),
 *  which Turbopack can't statically scope. Harmless: the route is gated to
 *  notFound() in production and EnergyKnowledgeBase/ is vercelignored, so this
 *  code never runs in prod. The warning is inherent to a dev-only fs-reading
 *  route and not worth contorting the code to silence. */
export function libraryRoot(): string {
  return resolve(process.cwd(), "EnergyKnowledgeBase");
}
const SUBDIRS = ["talks", "reports"] as const;

export interface SourceEntry {
  frontmatter: ResourceFrontmatter;
  wordCount: number;
  /** Path relative to the library root, e.g. "talks/foo.md". */
  file: string;
}

export async function readAllSources(root = libraryRoot()): Promise<SourceEntry[]> {
  const entries: SourceEntry[] = [];
  for (const sub of SUBDIRS) {
    let files: string[] = [];
    try {
      files = (await readdir(join(root, sub))).filter((f) => f.endsWith(".md"));
    } catch {
      continue; // subdir may not exist yet
    }
    for (const f of files) {
      try {
        const doc = parse(await readFile(join(root, sub, f), "utf8"));
        entries.push({
          frontmatter: doc.frontmatter,
          wordCount: doc.body.split(/\s+/).filter(Boolean).length,
          file: `${sub}/${f}`,
        });
      } catch {
        // skip unparseable file
      }
    }
  }
  entries.sort((a, b) =>
    (b.frontmatter.published ?? b.frontmatter.retrieved).localeCompare(
      a.frontmatter.published ?? a.frontmatter.retrieved,
    ),
  );
  return entries;
}

/** Read one source by id. Returns null if not found or id is unsafe. */
export async function readSource(
  id: string,
  root = libraryRoot(),
): Promise<ResourceDoc | null> {
  if (!/^[a-z0-9-]+$/.test(id)) return null; // path-traversal guard
  for (const sub of SUBDIRS) {
    try {
      return parse(await readFile(join(root, sub, `${id}.md`), "utf8"));
    } catch {
      // try next subdir
    }
  }
  return null;
}

export interface IndexResult {
  count: number;
  talks: number;
  reports: number;
}

/** Regenerate INDEX.md from every file's frontmatter. */
export async function buildIndex(root = libraryRoot()): Promise<IndexResult> {
  const entries = await readAllSources(root);
  const talks = entries.filter((e) => e.frontmatter.type === "talk");
  const reports = entries.filter((e) => e.frontmatter.type === "report");

  const lines: string[] = [
    "# EnergyKnowledgeBase — Index",
    "",
    `_${entries.length} sources — ${talks.length} talks, ${reports.length} reports. ` +
      `Auto-generated; do not edit by hand._`,
    "",
    "To cite a moment in a talk, append `&t=<seconds>s` from the `(&t=…)` marker in the",
    "transcript body to that talk's `source_url`.",
    "",
  ];

  const table = (
    rows: SourceEntry[],
    who: (r: ResourceFrontmatter) => string,
  ): string[] => {
    const o = [
      "| id | title | source | published | tags |",
      "| --- | --- | --- | --- | --- |",
    ];
    for (const { frontmatter: r } of rows) {
      o.push(
        `| \`${r.id}\` | ${r.title} | ${who(r)} | ${r.published ?? "—"} | ${r.tags.join(", ")} |`,
      );
    }
    return o;
  };

  if (talks.length) {
    lines.push("## Talks", "");
    lines.push(
      ...table(talks, (r) => `${r.speaker ?? r.channel ?? "—"} ([link](${r.source_url}))`),
      "",
    );
  }
  if (reports.length) {
    lines.push("## Reports", "");
    lines.push(
      ...table(reports, (r) => `${r.publisher ?? "—"} ([link](${r.source_url}))`),
      "",
    );
  }

  await writeFile(join(root, "INDEX.md"), `${lines.join("\n")}\n`);
  return { count: entries.length, talks: talks.length, reports: reports.length };
}
