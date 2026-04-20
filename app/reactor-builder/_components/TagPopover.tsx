"use client";

import type { TaxonomyTag } from "@/lib/reactor-types";
import { Popover } from "@/app/_components/Popover";

interface TagPopoverProps {
  tag: TaxonomyTag;
  /** If the host chip is in its selected state (dark background), invert
      the trigger colors so the "i" mark stays visible. */
  inverted?: boolean;
}

/**
 * TagPopover — per-chip concept explainer.
 *
 * Renders as a small "i" (literal character, no icon) in the corner of
 * a TagChip. Click opens a popover with the tag's oneLineHook, popoverBody,
 * and citation links.
 *
 * Reuses the shared Popover shell from app/_components/Popover.tsx so the
 * a11y behavior (Esc, click-outside, focus-return) is identical to
 * Module 1's CiteButton.
 *
 * On mobile (<640px), the popover panel renders as a bottom sheet via
 * responsive Tailwind classes in the panelClassName.
 */
export function TagPopover({ tag, inverted }: TagPopoverProps) {
  const triggerClassName = `
    inline-flex items-center justify-center w-[22px] h-[22px]
    rounded-full border
    font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium
    cursor-pointer transition-colors duration-[var(--duration-fast)]
    leading-none
    ${
      inverted
        ? "border-[var(--color-bg)] text-[var(--color-bg)] opacity-70 hover:opacity-100"
        : "border-[var(--color-rule-strong)] text-[var(--color-text-muted)] bg-[var(--color-bg)] hover:border-[var(--color-text)] hover:text-[var(--color-text)]"
    }
  `;

  // Desktop: anchored below-right of chip. Mobile (<640px): full-width
  // bottom sheet per design review decision.
  const panelClassName = `
    z-50 bg-[var(--color-surface)] border border-[var(--color-rule-strong)]
    rounded-[var(--radius-md)] p-[var(--spacing-6)]
    animate-[fadeIn_150ms_ease-out]

    /* desktop anchor */
    max-sm:fixed max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:top-auto
    max-sm:w-full max-sm:max-w-full max-sm:rounded-b-none
    max-sm:border-x-0 max-sm:border-b-0 max-sm:max-h-[80vh] max-sm:overflow-y-auto

    sm:absolute sm:top-[calc(100%+var(--spacing-2))] sm:right-0
    sm:w-[min(380px,calc(100vw-2rem))]
  `;

  return (
    <Popover
      trigger={<>i</>}
      triggerAriaLabel={`About ${tag.label}`}
      triggerTitle={`About ${tag.label}`}
      triggerClassName={triggerClassName}
      panelClassName={panelClassName}
    >
      {({ titleId, close }) => (
        <>
          <div className="flex items-start justify-between gap-[var(--spacing-3)] mb-[var(--spacing-3)]">
            <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)] m-0">
              {"/ " + tag.label}
            </p>
            <button
              onClick={close}
              aria-label="Close explainer"
              className="font-[family-name:var(--font-display)] text-[length:var(--text-base)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] cursor-pointer leading-none px-[var(--spacing-1)] bg-transparent border-0"
            >
              ×
            </button>
          </div>
          <h4
            id={titleId}
            className="font-[family-name:var(--font-display)] text-[length:var(--text-lg)] font-medium tracking-[-0.015em] leading-[1.25] mb-[var(--spacing-3)]"
          >
            {tag.oneLineHook}
          </h4>
          <p className="font-[family-name:var(--font-body)] text-[length:var(--text-sm)] leading-[1.6] text-[var(--color-text-muted)] m-0 mb-[var(--spacing-4)]">
            {tag.popoverBody}
          </p>
          <ul className="border-t border-[var(--color-rule)] pt-[var(--spacing-3)] list-none m-0 p-0">
            {tag.citations.map((c) => (
              <li key={c.bibtex_key} className="mb-[var(--spacing-1)] last:mb-0">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] leading-[1.5] text-[var(--color-text-faint)] hover:text-[var(--color-accent)] transition-colors duration-[var(--duration-fast)] no-underline"
                >
                  {c.author}, {c.year}. {c.title}.{" "}
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </Popover>
  );
}
