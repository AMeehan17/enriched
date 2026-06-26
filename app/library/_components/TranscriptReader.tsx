"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ResourceFrontmatter } from "@/lib/resources-schema";

const TALK_LINE = /^\[(\d\d:\d\d)\] \(&t=(\d+)s\) (.*)$/;

function deeplink(sourceUrl: string, seconds: number): string {
  const sep = sourceUrl.includes("?") ? "&" : "?";
  return `${sourceUrl}${sep}t=${seconds}s`;
}

/** Split a line into <mark>-highlighted spans around the needle. */
function highlight(text: string, needle: string): React.ReactNode {
  if (!needle) return text;
  const parts = text.split(new RegExp(`(${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return parts.map((p, i) =>
    p.toLowerCase() === needle.toLowerCase() ? (
      <mark key={i} className="bg-[var(--color-accent-soft)] text-[var(--color-accent-text)] rounded-[2px] px-[1px]">
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export function TranscriptReader({
  fm,
  body,
}: {
  fm: ResourceFrontmatter;
  body: string;
}) {
  const [q, setQ] = useState("");
  const lines = useMemo(() => body.split("\n").filter((l) => l.trim() !== ""), [body]);
  const needle = q.trim();

  const visible = useMemo(() => {
    if (!needle) return lines;
    const n = needle.toLowerCase();
    return lines.filter((l) => l.toLowerCase().includes(n));
  }, [lines, needle]);

  const who = fm.speaker ?? fm.channel ?? fm.publisher ?? "—";

  return (
    <main
      id="main-content"
      className="relative z-[1] mx-auto max-w-[760px] px-[var(--spacing-4)] sm:px-[var(--spacing-6)]
        py-[var(--spacing-12)]"
    >
      <Link
        href="/library"
        className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] uppercase tracking-[0.08em]
          text-[var(--color-text-muted)] no-underline hover:text-[var(--color-accent-text)]"
      >
        ← Library
      </Link>

      <header className="mt-[var(--spacing-4)] mb-[var(--spacing-8)] pb-[var(--spacing-6)] border-b border-[var(--color-rule-strong)]">
        <div className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] uppercase tracking-[0.1em] text-[var(--color-accent-text)] mb-[var(--spacing-2)]">
          {fm.type}
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-[length:var(--text-2xl)] font-semibold tracking-[-0.02em] text-[var(--color-text)] leading-[1.15] m-0">
          {fm.title}
        </h1>
        <p className="font-[family-name:var(--font-body)] text-[length:var(--text-sm)] text-[var(--color-text-muted)] mt-[var(--spacing-3)]">
          {who}
          {fm.published ? `  ·  ${fm.published}` : ""}
          {typeof fm.duration_s === "number"
            ? `  ·  ${Math.round(fm.duration_s / 60)} min`
            : ""}
        </p>
        <div className="flex flex-wrap items-center gap-[var(--spacing-3)] mt-[var(--spacing-3)]">
          <a
            href={fm.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-muted)] underline decoration-[var(--color-rule-strong)] hover:text-[var(--color-accent-text)]"
          >
            source ↗
          </a>
          {fm.tags.map((t) => (
            <span
              key={t}
              className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-faint)]
                border border-[var(--color-rule)] rounded-[var(--radius-pill)] px-[var(--spacing-2)] py-[1px]"
            >
              {t}
            </span>
          ))}
        </div>
      </header>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search this transcript…"
        aria-label="Search this transcript"
        className="w-full font-[family-name:var(--font-body)] text-[length:var(--text-sm)]
          bg-[var(--color-surface)] border border-[var(--color-rule-strong)] rounded-[var(--radius-md)]
          px-[var(--spacing-3)] py-[var(--spacing-2)] mb-[var(--spacing-2)]
          text-[var(--color-text)] placeholder:text-[var(--color-text-faint)]"
      />
      {needle && (
        <p className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] tabular-nums text-[var(--color-text-faint)] mb-[var(--spacing-4)]">
          {visible.length} of {lines.length} segments match
        </p>
      )}

      <div className="flex flex-col gap-[var(--spacing-4)]">
        {visible.map((line, idx) => {
          const m = fm.type === "talk" ? line.match(TALK_LINE) : null;
          if (m) {
            const [, label, secs, text] = m;
            return (
              <p key={idx} className="m-0 leading-[1.6]">
                <a
                  href={deeplink(fm.source_url, Number(secs))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] tabular-nums
                    text-[var(--color-accent-text)] no-underline mr-[var(--spacing-3)] align-baseline
                    hover:underline shrink-0"
                  title="Open this moment on the source"
                >
                  {label}
                </a>
                <span className="font-[family-name:var(--font-body)] text-[length:var(--text-base)] text-[var(--color-text)]">
                  {highlight(text ?? "", needle)}
                </span>
              </p>
            );
          }
          return (
            <p
              key={idx}
              className="m-0 font-[family-name:var(--font-mono)] text-[length:var(--text-sm)] leading-[1.6]
                text-[var(--color-text)] whitespace-pre-wrap"
            >
              {highlight(line, needle)}
            </p>
          );
        })}
      </div>
    </main>
  );
}
