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
 * The ENTIRE chip is a toggle button (click anywhere to select/deselect).
 * A small circled "i" info button floats in the top-right corner and
 * uses stopPropagation so clicking it opens the popover without firing
 * the chip toggle underneath.
 *
 * Selected state: filled --color-text background with --color-bg text.
 * Unselected: border + --color-text-muted text.
 */
export function TagChip({ tag, selected, onToggle }: TagChipProps) {
  return (
    <div
      className={`relative rounded-[var(--radius-md)] border transition-colors duration-[var(--duration-fast)] ${
        selected
          ? "border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)]"
          : "border-[var(--color-rule)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-rule-strong)]"
      }`}
    >
      {/* The whole chip is the toggle target. Reserve right padding so text
          doesn't collide with the floating info button. */}
      <button
        onClick={onToggle}
        aria-pressed={selected}
        className="block w-full text-left cursor-pointer bg-transparent border-0 p-[var(--spacing-3)] pr-[var(--spacing-8)] font-inherit color-inherit rounded-[var(--radius-md)]"
      >
        <span className="block font-[family-name:var(--font-display)] text-[length:var(--text-base)] font-medium tracking-[-0.01em] leading-[1.2] mb-[var(--spacing-1)]">
          {tag.label}
        </span>
        <span
          className={`block font-[family-name:var(--font-body)] text-[length:var(--text-sm)] leading-[1.45] ${
            selected
              ? "text-[var(--color-bg)] opacity-80"
              : "text-[var(--color-text-muted)]"
          }`}
        >
          {tag.oneLineHook}
        </span>
      </button>
      {/* Info button floats above the toggle, stopPropagation keeps clicks
          from firing the chip toggle. The circled border makes it visually
          distinct as a separate affordance. */}
      <div
        className="absolute top-[var(--spacing-2)] right-[var(--spacing-2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <TagPopover tag={tag} inverted={selected} />
      </div>
    </div>
  );
}
