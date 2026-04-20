"use client";

import type { TaxonomyTag } from "@/lib/reactor-types";
import { TagPopover } from "./TagPopover";

interface TagChipProps {
  tag: TaxonomyTag;
  selected: boolean;
  onToggle: () => void;
}

/**
 * TagChip — one F/C/X chip in a step.
 *
 * Two affordances in one row: the chip (toggles selection) and a small
 * info button (opens a popover with the concept explainer). Click
 * anywhere on the chip to toggle; click the info button specifically to
 * read the explainer without toggling.
 *
 * Selected state: filled --color-text background with --color-bg text.
 * Unselected: border + --color-text-muted text.
 * Matches Module 1's SourcePills visual language.
 */
export function TagChip({ tag, selected, onToggle }: TagChipProps) {
  return (
    <div
      className={`relative flex flex-col gap-[var(--spacing-1)] p-[var(--spacing-3)] rounded-[var(--radius-md)] border transition-colors duration-[var(--duration-fast)] ${
        selected
          ? "border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)]"
          : "border-[var(--color-rule)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-rule-strong)]"
      }`}
    >
      <button
        onClick={onToggle}
        aria-pressed={selected}
        className="flex items-baseline justify-between gap-[var(--spacing-3)] text-left cursor-pointer bg-transparent border-0 p-0 font-inherit color-inherit"
      >
        <span className="font-[family-name:var(--font-display)] text-[length:var(--text-base)] font-medium tracking-[-0.01em] leading-[1.2]">
          {tag.label}
        </span>
      </button>
      <p
        className={`font-[family-name:var(--font-body)] text-[length:var(--text-sm)] leading-[1.45] m-0 ${
          selected ? "text-[var(--color-bg)] opacity-80" : "text-[var(--color-text-muted)]"
        }`}
      >
        {tag.oneLineHook}
      </p>
      <div className="absolute top-[var(--spacing-1)] right-[var(--spacing-1)]">
        <TagPopover tag={tag} inverted={selected} />
      </div>
    </div>
  );
}
