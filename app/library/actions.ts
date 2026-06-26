"use server";

import { writeFile, rm, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { ingestYoutubeUrl, ingestPdfFile } from "@/lib/resources-ingest";

export type IngestState = { ok: boolean; message: string } | null;

/** The /library tooling is local-dev-only — it shells out to yt-dlp/pdftotext
 *  and writes to the gitignored library. Block it everywhere else. */
function prodGuard(): IngestState {
  return process.env.NODE_ENV === "production"
    ? { ok: false, message: "Ingestion is disabled outside local development." }
    : null;
}

function parseTags(fd: FormData): string[] {
  return String(fd.get("tags") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function ingestYoutubeAction(
  _prev: IngestState,
  fd: FormData,
): Promise<IngestState> {
  const guard = prodGuard();
  if (guard) return guard;
  const url = String(fd.get("url") ?? "").trim();
  if (!url) return { ok: false, message: "Paste a YouTube URL." };
  const speaker = String(fd.get("speaker") ?? "").trim();
  try {
    const r = await ingestYoutubeUrl(url, {
      speaker: speaker || undefined,
      tags: parseTags(fd),
    });
    revalidatePath("/library");
    return { ok: true, message: `Added “${r.title}” — ${r.words.toLocaleString()} words.` };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function ingestPdfAction(
  _prev: IngestState,
  fd: FormData,
): Promise<IngestState> {
  const guard = prodGuard();
  if (guard) return guard;
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, message: "Choose a PDF file." };
  const MAX_BYTES = 25 * 1024 * 1024;
  if (file.size > MAX_BYTES)
    return { ok: false, message: `PDF too large (${(file.size / 1048576).toFixed(1)}MB; 25MB max).` };
  const publisher = String(fd.get("publisher") ?? "").trim();
  if (!publisher) return { ok: false, message: "Publisher is required for a report." };
  const url = String(fd.get("url") ?? "").trim();
  // A web upload's temp file is deleted after ingest, so a file:// fallback would
  // be a dead citation. Require the real public source URL instead.
  if (!url)
    return { ok: false, message: "A public source URL is required so the citation points at a verifiable source." };
  const title = String(fd.get("title") ?? "").trim();
  const date = String(fd.get("date") ?? "").trim();

  const tmp = await mkdtemp(join(tmpdir(), "ekb-pdf-"));
  const tmpPath = join(tmp, "upload.pdf");
  try {
    await writeFile(tmpPath, Buffer.from(await file.arrayBuffer()));
    const r = await ingestPdfFile(tmpPath, {
      publisher,
      title: title || file.name.replace(/\.pdf$/i, "") || undefined,
      url: url || undefined,
      date: date || undefined,
      tags: parseTags(fd),
    });
    revalidatePath("/library");
    return { ok: true, message: `Added “${r.title}” — ${r.words.toLocaleString()} words.` };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}
