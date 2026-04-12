"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import type { Citation } from "@/lib/data-types";
import { generateBibTeX } from "@/lib/citation";

interface CiteButtonProps {
  citation: Citation;
  sourceLabel: string;
  dimensionLabel: string;
}

/**
 * CiteButton — the `{}` affordance on every data point.
 *
 * Click opens an anchored popover with the BibTeX entry and a Copy button.
 * Esc or click-outside closes the popover. Focus returns to the button on
 * close (accessibility requirement from DESIGN.md and the eng review).
 *
 * No <dialog>, no backdrop blur, no scale-in animation. Just opacity 0 → 1
 * in 100ms. This is the anti-slop rule from the design review.
 */
export function CiteButton({
  citation,
  sourceLabel,
  dimensionLabel,
}: CiteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  const bibtex = generateBibTeX(citation);

  const close = useCallback(() => {
    setIsOpen(false);
    // Return focus to the trigger button
    buttonRef.current?.focus();
  }, []);

  // Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, close]);

  // Click-outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        close();
      }
    };
    // Delay one tick so the opening click doesn't immediately close
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen, close]);

  // Auto-clear copy feedback
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

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={isOpen ? popoverId : undefined}
        aria-label={`Cite ${sourceLabel} ${dimensionLabel}`}
        title="Cite this value"
        className={`
          w-6 h-6 rounded-[var(--radius-sm)]
          border border-[var(--color-rule)]
          bg-transparent
          font-[family-name:var(--font-display)] text-[length:var(--text-xs)]
          text-[var(--color-text-muted)]
          cursor-pointer transition-all duration-[var(--duration-fast)]
          flex items-center justify-center
          hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] hover:border-[var(--color-accent)]
          ${isOpen ? "bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-accent)]" : ""}
        `}
      >
        {"{}"}
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          id={popoverId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${popoverId}-title`}
          className="absolute top-[calc(100%+var(--spacing-2))] right-0 z-50 w-[min(540px,calc(100vw-2rem))] bg-[var(--color-surface)] border border-[var(--color-rule)] rounded-[var(--radius-md)] p-[var(--spacing-6)] shadow-none animate-[fadeIn_100ms_ease-out]"
          style={{ opacity: 1 }}
        >
          <div className="flex items-start justify-between mb-[var(--spacing-3)]">
            <p
              id={`${popoverId}-title`}
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
        </div>
      )}
    </div>
  );
}
