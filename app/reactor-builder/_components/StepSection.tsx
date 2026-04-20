"use client";

import type { TaxonomyTag } from "@/lib/reactor-types";
import { TagChip } from "./TagChip";

interface StepSectionProps {
  stepNumber: 1 | 2 | 3;
  title: string;
  intro: string;
  tags: ReadonlyArray<TaxonomyTag>;
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onClear: (() => void) | undefined;
  dim: boolean;
  /** Optional sub-groups for rendering tags in multiple labeled groups
      (used by Step 3 for Scale + Capability sub-rows). */
  subGroups?: ReadonlyArray<{
    label: string;
    tags: ReadonlyArray<TaxonomyTag>;
  }>;
}

/**
 * StepSection — one sequential step in the reactor builder.
 *
 * Renders a numbered header (01, 02, 03), the step title, a 1-2 sentence
 * intro, and a chip grid. When `dim` is true, the section renders at
 * opacity 0.4 with pointer-events: none — visually signaling the gate
 * but keeping the markup in the DOM for screen readers.
 *
 * Steps 1 and 2 render a single flat chip grid via the `tags` prop.
 * Step 3 renders two sub-groups (Scale + Capability) via the `subGroups`
 * prop, each with a sub-label.
 *
 * Per the design review, chips are multi-select toggles: clicking a
 * selected chip deselects it; clicking an unselected chip adds it.
 * The matching function (Block 3) ORs within a dimension, so multiple
 * chips selected in this step broaden the filter.
 */
export function StepSection({
  stepNumber,
  title,
  intro,
  tags,
  selected,
  onToggle,
  onClear,
  dim,
  subGroups,
}: StepSectionProps) {
  const paddedNum = String(stepNumber).padStart(2, "0");

  return (
    <section
      className={`border-t border-[var(--color-rule)] py-[var(--spacing-12)] transition-opacity duration-[var(--duration-medium)] ${
        dim ? "opacity-40 pointer-events-none" : ""
      }`}
      aria-disabled={dim || undefined}
    >
      <header className="flex items-baseline gap-[var(--spacing-4)] mb-[var(--spacing-4)]">
        <span
          aria-hidden="true"
          className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)] min-w-[48px]"
        >
          Step {paddedNum}
        </span>
        <h3 className="font-[family-name:var(--font-display)] text-[length:var(--text-xl)] sm:text-[length:var(--text-2xl)] font-medium tracking-[-0.02em] leading-[1.1] m-0 flex-1">
          {title}
        </h3>
      </header>
      <p className="font-[family-name:var(--font-body)] text-[length:var(--text-base)] text-[var(--color-text-muted)] max-w-[560px] mb-[var(--spacing-6)]">
        {intro}
      </p>

      {subGroups ? (
        subGroups.map((group) => (
          <div key={group.label} className="mb-[var(--spacing-6)] last:mb-0">
            <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-[var(--spacing-3)]">
              {group.label}
            </p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-[var(--spacing-2)]">
              {group.tags.map((tag) => (
                <TagChip
                  key={tag.id}
                  tag={tag}
                  selected={selected.has(tag.id)}
                  onToggle={() => onToggle(tag.id)}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[var(--spacing-2)]">
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              tag={tag}
              selected={selected.has(tag.id)}
              onToggle={() => onToggle(tag.id)}
            />
          ))}
        </div>
      )}

      {onClear ? (
        <div className="mt-[var(--spacing-4)]">
          <button
            onClick={onClear}
            className="font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-[var(--duration-fast)] cursor-pointer -ml-[12px] px-[var(--spacing-3)] py-[var(--spacing-2)]"
          >
            <span aria-hidden="true" className="text-[var(--color-accent)]">
              ×{" "}
            </span>
            Clear selection
          </button>
        </div>
      ) : null}
    </section>
  );
}
