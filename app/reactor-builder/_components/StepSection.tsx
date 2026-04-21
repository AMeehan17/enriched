"use client";

import type { TaxonomyTag } from "@/lib/reactor-types";
import { TagChip } from "./TagChip";

interface StepSectionProps {
  stepNumber: 1 | 2 | 3 | 4 | 5;
  /** Override the numeric label — used for sub-steps like "1a" (kickstarter). */
  subStepLabel?: string;
  title: string;
  intro: string;
  tags: ReadonlyArray<TaxonomyTag>;
  selected: ReadonlySet<string>;
  /** Tag IDs that should render locked (dimmed + non-interactive) even
      though the step overall is active. Used for coolant options that are
      physically impossible under the current fuel form. */
  lockedIds?: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onClear: (() => void) | undefined;
  dim: boolean;
  /** Optional sub-groups (used by Step 4 for Scale + Capability rows). */
  subGroups?: ReadonlyArray<{
    label: string;
    tags: ReadonlyArray<TaxonomyTag>;
  }>;
}

export function StepSection({
  stepNumber,
  subStepLabel,
  title,
  intro,
  tags,
  selected,
  lockedIds,
  onToggle,
  onClear,
  dim,
  subGroups,
}: StepSectionProps) {
  const label = subStepLabel ?? String(stepNumber).padStart(2, "0");

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
          Step {label}
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
                  locked={lockedIds?.has(tag.id) ?? false}
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
              locked={lockedIds?.has(tag.id) ?? false}
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
