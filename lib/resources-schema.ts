/**
 * resources-schema.ts — the one source of truth for the EnergyKnowledgeBase
 * personal source library (talks + reports). Tracked + committed; the *data*
 * it describes lives in the gitignored `EnergyKnowledgeBase/` folder.
 *
 * Both ingest scripts (scripts/ingest-youtube.ts, scripts/ingest-pdf.ts) and
 * the index builder import from here so every file shares one format. Pure TS,
 * no Node deps — safe to import anywhere.
 *
 * See ~/.gstack/projects/AMeehan17-enriched/andrew-main-design-*.md for design.
 */

import type { Citation } from "./data-types";

export type ResourceType = "talk" | "report";

export interface ResourceFrontmatter {
  /** Stable slug — citation key AND filename AND dedup key. */
  id: string;
  type: ResourceType;
  title: string;
  /** Person who spoke. Talks: optional (often a panel; channel is the identity). */
  speaker?: string;
  /** Publishing org. Reports: REQUIRED. */
  publisher?: string;
  /** Channel/series a talk was published under (e.g. "Catalyst with Shayle Kann"). */
  channel?: string;
  source_url: string;
  /** ISO date (YYYY-MM-DD) the source was published, when known. */
  published?: string;
  /** Talk length in seconds. */
  duration_s?: number;
  /** ISO date (YYYY-MM-DD) this file was ingested. */
  retrieved: string;
  tags: string[];
}

export interface ResourceDoc {
  frontmatter: ResourceFrontmatter;
  body: string;
}

/** Returns a list of validation errors. Empty array = valid. Callers fail loud. */
export function validateFrontmatter(fm: ResourceFrontmatter): string[] {
  const errors: string[] = [];
  if (!fm.id) errors.push("missing required field: id");
  if (!fm.title) errors.push("missing required field: title");
  if (!fm.source_url) errors.push("missing required field: source_url");
  if (!fm.retrieved) errors.push("missing required field: retrieved");
  if (fm.type !== "talk" && fm.type !== "report")
    errors.push(`type must be "talk" or "report" (got: ${String(fm.type)})`);
  if (fm.type === "talk" && !fm.speaker && !fm.channel)
    errors.push("talk requires a speaker or channel (identity field)");
  if (fm.type === "report" && !fm.publisher)
    errors.push("report requires a publisher");
  if (fm.id && !/^[a-z0-9][a-z0-9-]*$/.test(fm.id))
    errors.push(`id must be a lowercase slug, got: ${fm.id}`);
  if (!Array.isArray(fm.tags)) errors.push("tags must be an array");
  return errors;
}

/** "How Will the US Unleash..." -> "how-will-the-us-unleash..." (max 80 chars). */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
    .replace(/-$/, "");
}

/** id = slug(title) + "-" + year. Falls back to slug alone if no date. */
export function makeId(title: string, dateISO?: string): string {
  const slug = slugify(title) || "untitled";
  const year = dateISO?.slice(0, 4);
  return year && /^\d{4}$/.test(year) ? `${slug}-${year}` : slug;
}

const ENTITIES: Array<[RegExp, string]> = [
  [/&lt;/g, "<"],
  [/&gt;/g, ">"],
  [/&quot;/g, '"'],
  [/&#39;/g, "'"],
  [/&apos;/g, "'"],
  [/&nbsp;/g, " "],
];

/** Decode the HTML entities YouTube auto-captions leak. &amp; decoded LAST. */
export function decodeEntities(s: string): string {
  let out = s;
  for (const [re, ch] of ENTITIES) out = out.replace(re, ch);
  out = out.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
  return out.replace(/&amp;/g, "&");
}

function yamlStr(v: string): string {
  return `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/** Serialize a doc to `---\n<frontmatter>\n---\n\n<body>\n`. Deterministic. */
export function serialize(doc: ResourceDoc): string {
  const fm = doc.frontmatter;
  const lines = ["---"];
  lines.push(`id: ${fm.id}`);
  lines.push(`type: ${fm.type}`);
  lines.push(`title: ${yamlStr(fm.title)}`);
  if (fm.speaker) lines.push(`speaker: ${yamlStr(fm.speaker)}`);
  if (fm.publisher) lines.push(`publisher: ${yamlStr(fm.publisher)}`);
  if (fm.channel) lines.push(`channel: ${yamlStr(fm.channel)}`);
  lines.push(`source_url: ${yamlStr(fm.source_url)}`);
  if (fm.published) lines.push(`published: ${fm.published}`);
  if (typeof fm.duration_s === "number") lines.push(`duration_s: ${fm.duration_s}`);
  lines.push(`retrieved: ${fm.retrieved}`);
  lines.push(`tags: [${fm.tags.join(", ")}]`);
  lines.push("---");
  return `${lines.join("\n")}\n\n${doc.body.trimEnd()}\n`;
}

/** Parse a serialized doc back. Minimal — only handles the format above. */
export function parse(raw: string): ResourceDoc {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) throw new Error("no frontmatter block found");
  const body = raw.slice((m[0] ?? "").length).replace(/^\n+/, "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fm: any = { tags: [] };
  for (const line of (m[1] ?? "").split("\n")) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (!mm || !mm[1]) continue;
    const key = mm[1];
    let val: string = (mm[2] ?? "").trim();
    if (key === "tags") {
      fm.tags = val
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (key === "duration_s") {
      fm.duration_s = Number(val);
    } else {
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      }
      fm[key] = val;
    }
  }
  return { frontmatter: fm as ResourceFrontmatter, body };
}

/** Promote a library entry into Enriched's Citation shape (the B-step bridge). */
export function toCitation(fm: ResourceFrontmatter): Citation {
  const year = (fm.published ?? fm.retrieved).slice(0, 4);
  const citation: Citation = {
    bibtex_key: fm.id.replace(/-/g, "_"),
    author: fm.speaker ?? fm.channel ?? fm.publisher ?? "Unknown",
    title: fm.title,
    year: Number(year),
    url: fm.source_url,
    accessed: fm.retrieved,
  };
  const publisher = fm.publisher ?? fm.channel;
  if (publisher) citation.publisher = publisher;
  return citation;
}
