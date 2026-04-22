"use client";

import type { StepExplainer } from "@/lib/reactor-types";
import { Popover } from "@/app/_components/Popover";

interface StepWhyProps {
  explainer: StepExplainer;
}

/**
 * StepWhy — step-level "why this decision has massive ramifications" popover.
 *
 * Renders as a small circled `?` next to a step's title. Click opens a
 * Popover with the step explainer's title, body, and citations. Same
 * a11y shell as TagPopover (Esc, click-outside, focus-return).
 *
 * Distinct from TagPopover in two ways:
 *   - TagPopover explains *a thing* (a specific fuel, coolant, chip)
 *   - StepWhy explains *why the category of choice exists* at all
 *   - Visual trigger is `?` instead of `i` so the two are never confused
 */
export function StepWhy({ explainer }: StepWhyProps) {
  const triggerClassName = `
    inline-flex items-center justify-center w-[22px] h-[22px]
    rounded-full border
    font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium
    cursor-pointer transition-colors duration-[var(--duration-fast)]
    leading-none
    border-[var(--color-rule-strong)] text-[var(--color-text-muted)] bg-[var(--color-bg)]
    hover:border-[var(--color-accent)] hover:text-[var(--color-accent-text)]
  `;

  const panelClassName = `
    z-50 bg-[var(--color-surface)] border border-[var(--color-rule-strong)]
    rounded-[var(--radius-md)] p-[var(--spacing-6)]
    animate-[fadeIn_150ms_ease-out]

    max-sm:fixed max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:top-auto
    max-sm:w-full max-sm:max-w-full max-sm:rounded-b-none
    max-sm:border-x-0 max-sm:border-b-0 max-sm:max-h-[80vh] max-sm:overflow-y-auto

    sm:absolute sm:top-[calc(100%+var(--spacing-2))] sm:left-0
    sm:w-[min(420px,calc(100vw-2rem))]
  `;

  return (
    <Popover
      trigger={<>?</>}
      triggerAriaLabel={`Why this decision matters: ${explainer.title}`}
      triggerTitle={`Why this decision matters`}
      triggerClassName={triggerClassName}
      panelClassName={panelClassName}
    >
      {({ titleId, close }) => (
        <>
          <div className="flex items-start justify-between gap-[var(--spacing-3)] mb-[var(--spacing-3)]">
            <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)] m-0">
              {"// Why this decision"}
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
            {explainer.title}
          </h4>
          <p className="font-[family-name:var(--font-body)] text-[length:var(--text-sm)] leading-[1.6] text-[var(--color-text-muted)] m-0 mb-[var(--spacing-4)]">
            {explainer.body}
          </p>
          <ul className="border-t border-[var(--color-rule)] pt-[var(--spacing-3)] list-none m-0 p-0">
            {explainer.citations.map((c) => (
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
