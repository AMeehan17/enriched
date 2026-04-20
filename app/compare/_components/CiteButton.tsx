"use client";

import { useState, useEffect, useCallback } from "react";
import type { Citation } from "@/lib/data-types";
import { generateBibTeX } from "@/lib/citation";
import { Popover } from "@/app/_components/Popover";

interface CiteButtonProps {
  citation: Citation;
  sourceLabel: string;
  dimensionLabel: string;
}

/**
 * CiteButton — the `{}` affordance on every data point.
 *
 * Click opens an anchored popover with the BibTeX entry and a Copy button.
 * Wraps the shared Popover shell from app/_components/Popover.tsx (the shell
 * owns Esc/click-outside/focus-return behavior and aria plumbing) and
 * contributes the BibTeX-specific content.
 *
 * Refactored from the original standalone implementation in Module 2's
 * Block 4 work so Module 2's TagPopover can reuse the same shell without
 * duplicating the a11y event handling.
 */
export function CiteButton({
  citation,
  sourceLabel,
  dimensionLabel,
}: CiteButtonProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const bibtex = generateBibTeX(citation);

  // Auto-clear copy feedback after 1.5s
  useEffect(() => {
    if (copyState === "idle") return;
    const timer = setTimeout(() => setCopyState("idle"), 1500);
    return () => clearTimeout(timer);
  }, [copyState]);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(bibtex);
        setCopyState("copied");
      } else {
        setCopyState("error");
      }
    } catch {
      setCopyState("error");
    }
  }, [bibtex]);

  const triggerClassName = `
    w-6 h-6 rounded-[var(--radius-sm)]
    border border-[var(--color-rule)]
    bg-transparent
    font-[family-name:var(--font-display)] text-[length:var(--text-xs)]
    text-[var(--color-text-muted)]
    cursor-pointer transition-all duration-[var(--duration-fast)]
    flex items-center justify-center
    hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] hover:border-[var(--color-accent)]
  `;

  const panelClassName =
    "absolute top-[calc(100%+var(--spacing-2))] right-0 z-50 w-[min(540px,calc(100vw-2rem))] bg-[var(--color-surface)] border border-[var(--color-rule)] rounded-[var(--radius-md)] p-[var(--spacing-6)] shadow-none animate-[fadeIn_100ms_ease-out]";

  return (
    <Popover
      trigger={<>{"{}"}</>}
      triggerAriaLabel={`Cite ${sourceLabel} ${dimensionLabel}`}
      triggerTitle="Cite this value"
      triggerClassName={triggerClassName}
      panelClassName={panelClassName}
    >
      {({ titleId, close }) => (
        <>
          <div className="flex items-start justify-between mb-[var(--spacing-3)]">
            <p
              id={titleId}
              className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.1em] text-[var(--color-text-faint)]"
            >
              {"/ Cite this value"}
            </p>
            <button
              onClick={close}
              aria-label="Close citation popover"
              className="font-[family-name:var(--font-display)] text-[length:var(--text-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] cursor-pointer leading-none px-[var(--spacing-1)]"
            >
              ×
            </button>
          </div>

          <pre className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] leading-[1.7] text-[var(--color-text)] bg-[var(--color-bg)] border border-[var(--color-rule)] rounded-[var(--radius-sm)] p-[var(--spacing-4)] overflow-x-auto whitespace-pre">
            {bibtex}
          </pre>

          <div className="flex items-center gap-[var(--spacing-3)] mt-[var(--spacing-4)]">
            <button
              onClick={handleCopy}
              className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium px-[var(--spacing-4)] py-[var(--spacing-2)] bg-[var(--color-text)] text-[var(--color-bg)] border border-[var(--color-text)] rounded-[var(--radius-sm)] cursor-pointer hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors duration-[var(--duration-fast)]"
            >
              {copyState === "copied"
                ? "Copied!"
                : copyState === "error"
                  ? "Copy failed — select text"
                  : "Copy BibTeX"}
            </button>
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors duration-[var(--duration-fast)]"
            >
              Primary source ↗
            </a>
          </div>
        </>
      )}
    </Popover>
  );
}
