"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ResourceFrontmatter } from "@/lib/resources-schema";

export type LibraryItem = ResourceFrontmatter & { wordCount: number };

type Filter = "all" | "talk" | "report";

function who(item: LibraryItem): string {
  return item.speaker ?? item.channel ?? item.publisher ?? "—";
}

export function LibraryBrowser({ items }: { items: LibraryItem[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((it) => {
      if (filter !== "all" && it.type !== filter) return false;
      if (!needle) return true;
      const hay = [it.title, who(it), it.channel ?? "", it.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [items, q, filter]);

  const counts = useMemo(
    () => ({
      all: items.length,
      talk: items.filter((i) => i.type === "talk").length,
      report: items.filter((i) => i.type === "report").length,
    }),
    [items],
  );

  return (
    <section>
      <div className="flex flex-wrap items-center gap-[var(--spacing-3)] mb-[var(--spacing-4)]">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search titles, speakers, tags…"
          aria-label="Search the library"
          className="flex-1 min-w-[220px] font-[family-name:var(--font-body)] text-[length:var(--text-sm)]
            bg-[var(--color-surface)] border border-[var(--color-rule-strong)] rounded-[var(--radius-md)]
            px-[var(--spacing-3)] py-[var(--spacing-2)] text-[var(--color-text)]
            placeholder:text-[var(--color-text-faint)]"
        />
        <div className="flex gap-[2px]" role="group" aria-label="Filter by type">
          {(["all", "talk", "report"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`font-[family-name:var(--font-display)] text-[length:var(--text-xs)] uppercase tracking-[0.08em]
                px-[var(--spacing-3)] py-[var(--spacing-2)] border rounded-[var(--radius-sm)]
                transition-colors duration-[var(--duration-fast)] ${
                  filter === f
                    ? "bg-[var(--color-text)] text-[var(--color-bg)] border-[var(--color-text)]"
                    : "bg-transparent text-[var(--color-text-muted)] border-[var(--color-rule-strong)] hover:text-[var(--color-text)]"
                }`}
            >
              {f === "all" ? "All" : f === "talk" ? "Talks" : "Reports"}{" "}
              <span className="tabular-nums">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="font-[family-name:var(--font-body)] text-[length:var(--text-sm)] text-[var(--color-text-muted)] py-[var(--spacing-8)] text-center">
          {items.length === 0
            ? "Nothing ingested yet. Use the panel above to add your first source."
            : "No sources match that search."}
        </p>
      ) : (
        <ul className="list-none m-0 p-0 border-t border-[var(--color-rule)]">
          {filtered.map((it) => (
            <li key={it.id} className="border-b border-[var(--color-rule)]">
              <Link
                href={`/library/${it.id}`}
                className="group flex items-baseline gap-[var(--spacing-4)] no-underline
                  py-[var(--spacing-4)] hover:bg-[var(--color-surface)] transition-colors duration-[var(--duration-fast)]"
              >
                <span
                  className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] uppercase tracking-[0.08em]
                    text-[var(--color-text-faint)] w-[58px] shrink-0 pt-[2px]"
                >
                  {it.type}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-[family-name:var(--font-display)] text-[length:var(--text-base)]
                    font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent-text)]
                    transition-colors duration-[var(--duration-fast)] leading-snug">
                    {it.title}
                  </span>
                  <span className="block font-[family-name:var(--font-body)] text-[length:var(--text-sm)] text-[var(--color-text-muted)] mt-[2px]">
                    {who(it)}
                    {it.tags.length > 0 && (
                      <span className="text-[var(--color-text-faint)]">
                        {"  ·  "}
                        {it.tags.join(", ")}
                      </span>
                    )}
                  </span>
                </span>
                <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] tabular-nums
                  text-[var(--color-text-faint)] shrink-0 text-right">
                  <span className="block">{it.published ?? it.retrieved}</span>
                  <span className="block">{it.wordCount.toLocaleString()} w</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
