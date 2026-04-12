"use client";

import type { Source, SourceId } from "@/lib/data-types";

interface SourcePillsProps {
  sources: ReadonlyArray<Source>;
  selected: ReadonlyArray<SourceId>;
  onToggle: (id: SourceId) => void;
}

export function SourcePills({ sources, selected, onToggle }: SourcePillsProps) {
  return (
    <div className="mb-[var(--spacing-6)]">
      <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.1em] text-[var(--color-text-faint)] mb-[var(--spacing-3)]">
        {"/ Energy Sources"}
      </p>
      <div className="flex flex-wrap gap-[var(--spacing-2)]" role="group" aria-label="Energy source selection">
        {sources.map((source, i) => {
          const isActive = selected.includes(source.id);
          const isFirst = isActive && selected[0] === source.id;
          return (
            <button
              key={source.id}
              onClick={() => onToggle(source.id)}
              aria-pressed={isActive}
              className={`
                font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium
                px-[var(--spacing-4)] py-[var(--spacing-2)]
                border-[1.5px] rounded-[var(--radius-pill)]
                cursor-pointer transition-all duration-[var(--duration-fast)]
                ${isFirst
                  ? "bg-[var(--color-text)] text-[var(--color-bg)] border-[var(--color-text)]"
                  : isActive
                    ? "bg-[var(--color-rule)] text-[var(--color-text)] border-[var(--color-rule-strong)]"
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-rule-strong)] hover:border-[var(--color-text)] hover:text-[var(--color-text)]"
                }
              `}
            >
              {source.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
