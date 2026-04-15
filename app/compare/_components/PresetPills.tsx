"use client";

import type { Preset } from "@/lib/data-types";

interface PresetPillsProps {
  presets: ReadonlyArray<Preset>;
  activeSlug: string;
  onPresetClick: (preset: Preset) => void;
}

/**
 * PresetPills — curated comparison configurations.
 *
 * Each pill loads a preset's state into the URL atomically: sources,
 * normalize baseline, and preset slug update in one navigation.
 *
 * When a user manually toggles a source pill or changes the normalize
 * dropdown after loading a preset, the preset param clears because the
 * state no longer matches. That logic lives in ComparisonView.
 */
export function PresetPills({
  presets,
  activeSlug,
  onPresetClick,
}: PresetPillsProps) {
  return (
    <div className="mb-[var(--spacing-6)]">
      <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.1em] text-[var(--color-text-faint)] mb-[var(--spacing-3)]">
        {"/ Presets — rebuttal in a link"}
      </p>
      <div
        className="flex flex-wrap gap-[var(--spacing-2)]"
        role="group"
        aria-label="Curated comparison presets"
      >
        {presets.map((preset) => {
          const isActive = activeSlug === preset.slug;
          return (
            <button
              key={preset.slug}
              onClick={() => onPresetClick(preset)}
              aria-pressed={isActive}
              title={preset.rhetoricalPoint}
              className={`
                font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium
                px-[var(--spacing-4)] py-[var(--spacing-2)]
                border-[1.5px] rounded-[var(--radius-pill)]
                cursor-pointer transition-all duration-[var(--duration-fast)]
                ${isActive
                  ? "bg-[var(--color-accent-text)] text-[var(--color-bg)] border-[var(--color-accent-text)]"
                  : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-rule-strong)] hover:border-[var(--color-accent-text)] hover:text-[var(--color-accent-text)]"
                }
              `}
            >
              {preset.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
