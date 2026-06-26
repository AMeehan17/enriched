/**
 * resources-ingest.ts — server-only ingestion core for EnergyKnowledgeBase.
 * Shared by the CLI scripts (scripts/ingest-*.ts) and the dev-only /library
 * server actions. Uses node:child_process (yt-dlp, pdftotext) + node:fs —
 * NEVER import from a client component.
 *
 * Functions throw Error on failure (callers decide how to surface it); they
 * never call process.exit, so they're safe to await inside a request.
 */
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, writeFile, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join, basename } from "node:path";
import {
  decodeEntities,
  makeId,
  serialize,
  validateFrontmatter,
  type ResourceFrontmatter,
} from "./resources-schema";
import { libraryRoot, buildIndex } from "./resources-library";

export interface IngestResult {
  id: string;
  type: "talk" | "report";
  /** Path relative to the library root. */
  file: string;
  words: number;
  title: string;
}

function ytdlp(args: string[]): string {
  try {
    return execFileSync("yt-dlp", args, {
      encoding: "utf8",
      maxBuffer: 128 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    const err = e as NodeJS.ErrnoException & { stderr?: Buffer | string };
    if (err.code === "ENOENT")
      throw new Error("yt-dlp not found. Install with: brew install yt-dlp");
    const detail = err.stderr ? String(err.stderr).trim().split("\n").pop() : err.message;
    throw new Error(`yt-dlp failed: ${detail}`);
  }
}

/**
 * WebVTT -> clean, deduplicated, timestamped body. Handles manual subs and
 * YouTube auto-captions (rolling, overlapping cues with inline word timing).
 */
export function vttToBody(vtt: string, bucketSeconds = 30): string {
  const blocks = vtt.split(/\r?\n\r?\n/);
  const segs: Array<{ start: number; text: string }> = [];
  let last = "";

  // Auto-captions "roll": each cue repeats prior line(s) then adds one new
  // final line, with inline <00:00:00.000><c> word timing. Manual subs don't.
  const isAuto = /<\d\d:\d\d:\d\d[.,]\d{3}><c>/.test(vtt);

  for (const block of blocks) {
    const lines = block.split(/\r?\n/).filter((l) => l.trim() !== "");
    const tsIdx = lines.findIndex((l) => /\d\d:\d\d:\d\d[.,]\d{3}\s*-->/.test(l));
    const tsLine = tsIdx === -1 ? undefined : lines[tsIdx];
    if (!tsLine) continue;
    const tsm = tsLine.match(/(\d\d):(\d\d):(\d\d)[.,]\d{3}\s*-->/);
    if (!tsm || !tsm[1] || !tsm[2] || !tsm[3]) continue;
    const start = +tsm[1] * 3600 + +tsm[2] * 60 + +tsm[3];

    const payload = lines.slice(tsIdx + 1).filter((l) => l.trim() !== "");
    if (payload.length === 0) continue;
    const chosen = isAuto ? [payload[payload.length - 1] as string] : payload;

    const text = decodeEntities(chosen.join(" ").replace(/<[^>]+>/g, ""))
      .replace(/\s+/g, " ")
      .trim();
    if (!text || text === last) continue;
    last = text;
    segs.push({ start, text });
  }

  const out: string[] = [];
  let bStart: number | null = null;
  let buf: string[] = [];
  let lastWord = "";
  const flush = () => {
    if (buf.length && bStart !== null) {
      const mm = String(Math.floor(bStart / 60)).padStart(2, "0");
      const ss = String(bStart % 60).padStart(2, "0");
      out.push(`[${mm}:${ss}] (&t=${bStart}s) ${buf.join(" ")}`);
    }
  };
  for (const s of segs) {
    // Seam dedup: when a caption line rolls, YouTube re-emits the boundary word
    // as the first word of the next line ("...the" then "the IBM PC"). Drop only
    // that one seam duplicate. Never collapse doubles *inside* a line, so genuine
    // speech ("I think that that company", "he had had it") survives verbatim —
    // faithfulness matters more than cosmetics for a citation tool.
    let words = s.text.split(/\s+/).filter(Boolean);
    if (lastWord && words.length && words[0]!.toLowerCase() === lastWord.toLowerCase()) {
      words = words.slice(1);
    }
    if (words.length === 0) continue;
    const text = words.join(" ");
    lastWord = words[words.length - 1]!;
    if (bStart === null) bStart = s.start;
    if (s.start - bStart >= bucketSeconds) {
      flush();
      buf = [text];
      bStart = s.start;
    } else {
      buf.push(text);
    }
  }
  flush();
  return out.join("\n");
}

export interface YoutubeOpts {
  speaker?: string | undefined;
  tags?: string[] | undefined;
  id?: string | undefined;
}

export async function ingestYoutubeUrl(
  url: string,
  opts: YoutubeOpts = {},
): Promise<IngestResult> {
  url = url.trim();
  if (!url) throw new Error("a YouTube URL is required");
  // Reject anything that isn't a plain http(s) URL. Without this, a value
  // starting with "-" is parsed by yt-dlp as an option (--exec, --config-
  // locations, file://...) → arbitrary command execution / SSRF. The "--"
  // separators below are belt-and-suspenders for the same class of bug.
  if (!/^https?:\/\/[^\s]+$/i.test(url))
    throw new Error("URL must be a plain http(s):// link");

  const firstLine = ytdlp(["-j", "--skip-download", "--", url]).trim().split("\n")[0];
  if (!firstLine) throw new Error("yt-dlp returned no metadata");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = JSON.parse(firstLine) as any;
  const ud: string | undefined = meta.upload_date;
  const published =
    ud && /^\d{8}$/.test(ud)
      ? `${ud.slice(0, 4)}-${ud.slice(4, 6)}-${ud.slice(6, 8)}`
      : undefined;

  const tmp = await mkdtemp(join(tmpdir(), "ekb-yt-"));
  try {
    ytdlp([
      "--write-subs",
      "--write-auto-sub",
      "--sub-lang",
      "en",
      "--sub-format",
      "vtt",
      "--skip-download",
      "-o",
      join(tmp, "%(id)s.%(ext)s"),
      "--",
      url,
    ]);
    let vtt: string;
    try {
      vtt = await readFile(join(tmp, `${meta.id}.en.vtt`), "utf8");
    } catch {
      throw new Error(
        `No English captions for "${meta.title}". Paste the transcript manually for now.`,
      );
    }
    const body = vttToBody(vtt);
    if (!body.trim()) throw new Error("Captions parsed to empty text.");

    const title = String(meta.title);
    const id = opts.id || makeId(title, published);
    const channel: string | undefined = meta.uploader ?? meta.channel ?? undefined;
    const duration: number | undefined =
      typeof meta.duration === "number" ? Math.round(meta.duration) : undefined;
    const fm: ResourceFrontmatter = {
      id,
      type: "talk",
      title,
      source_url: String(meta.webpage_url ?? url),
      retrieved: new Date().toISOString().slice(0, 10),
      tags: opts.tags ?? [],
      ...(opts.speaker ? { speaker: opts.speaker } : {}),
      ...(channel ? { channel } : {}),
      ...(published ? { published } : {}),
      ...(duration !== undefined ? { duration_s: duration } : {}),
    };
    const errors = validateFrontmatter(fm);
    if (errors.length) throw new Error(`invalid frontmatter: ${errors.join("; ")}`);

    await mkdir(join(libraryRoot(), "talks"), { recursive: true });
    await writeFile(join(libraryRoot(), "talks", `${id}.md`), serialize({ frontmatter: fm, body }));
    await buildIndex();
    return { id, type: "talk", file: `talks/${id}.md`, words: body.split(/\s+/).length, title };
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

export interface PdfOpts {
  publisher: string;
  title?: string | undefined;
  url?: string | undefined;
  date?: string | undefined;
  id?: string | undefined;
  tags?: string[] | undefined;
}

export async function ingestPdfFile(path: string, opts: PdfOpts): Promise<IngestResult> {
  if (!opts.publisher?.trim()) throw new Error("a publisher is required for reports");
  try {
    await access(path);
  } catch {
    throw new Error(`file not found: ${path}`);
  }

  let raw: string;
  try {
    raw = execFileSync("pdftotext", ["-layout", path, "-"], {
      encoding: "utf8",
      maxBuffer: 128 * 1024 * 1024,
    });
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "ENOENT")
      throw new Error("pdftotext not found. Install with: brew install poppler");
    throw new Error(`pdftotext failed: ${err.message}`);
  }
  const body = raw
    .replace(/\f/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!body)
    throw new Error("pdftotext produced no text (scanned/image PDF?). OCR is out of scope.");

  const title = opts.title?.trim() || basename(path).replace(/\.pdf$/i, "");
  const id = opts.id || makeId(title, opts.date);
  const fm: ResourceFrontmatter = {
    id,
    type: "report",
    title,
    publisher: opts.publisher,
    source_url: opts.url?.trim() || `file://${resolve(path)}`,
    retrieved: new Date().toISOString().slice(0, 10),
    tags: opts.tags ?? [],
    ...(opts.date ? { published: opts.date } : {}),
  };
  const errors = validateFrontmatter(fm);
  if (errors.length) throw new Error(`invalid frontmatter: ${errors.join("; ")}`);

  await mkdir(join(libraryRoot(), "reports"), { recursive: true });
  await writeFile(join(libraryRoot(), "reports", `${id}.md`), serialize({ frontmatter: fm, body }));
  await buildIndex();
  return { id, type: "report", file: `reports/${id}.md`, words: body.split(/\s+/).length, title };
}
