"use client";

import type { Source, SourceId, NormalizeOption } from "@/lib/data-types";

interface NormalizeDropdownProps {
  sources: ReadonlyArray<Source>;
  selected: ReadonlyArray<SourceId>;
  baseline: NormalizeOption;
  onBaselineChange: (baseline: NormalizeOption) => void;
}

export function NormalizeDropdown({
  sources,
  selected,
  baseline,
  onBaselineChange,
}: NormalizeDropdownProps) {
  const isDisabled = selected.length < 2;

  return (
    <div
      className={`
        flex items-center gap-[var(--spacing-4)]
        px-[var(--spacing-6)] py-[var(--spacing-4)]
        bg-[var(--color-surface)] border border-[var(--color-rule)] rounded-[var(--radius-md)]
        ${isDisabled ? "opacity-50" : ""}
      `}
    >
      <span className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.05em] text-[var(--color-text-faint)]">
        Normalize to
      </span>
      <select
        value={baseline}
        onChange={(e) => onBaselineChange(e.target.value as NormalizeOption)}
        disabled={isDisabled}
        aria-label="Normalize comparison baseline"
        className="font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium text-[var(--color-text)] bg-transparent border-0 border-b border-[var(--color-text)] pb-px cursor-pointer disabled:cursor-not-allowed"
      >
        <option value="none">None</option>
        {sources.map((source) => (
          <option key={source.id} value={source.id}>
            {source.label}
          </option>
        ))}
      </select>
      <span className="font-[family-name:var(--font-body)] text-[length:var(--text-sm)] text-[var(--color-text-muted)] ml-auto">
        {isDisabled
          ? "Select 2+ sources to normalize"
          : "Show all values as multiples of the baseline"}
      </span>
    </div>
  );
}
