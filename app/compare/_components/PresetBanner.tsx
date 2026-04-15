"use client";

import type { Preset } from "@/lib/data-types";

interface PresetBannerProps {
  preset: Preset;
  onDismiss: () => void;
}

/**
 * PresetBanner — dismissible inline banner shown when a preset is active.
 *
 * Shows the preset's title, description, and rhetorical point so the viewer
 * understands what argument the preset is making. Dismissing clears the
 * preset URL param (but keeps the current sources/normalize state so the
 * user can continue exploring from the preset's starting point).
 */
export function PresetBanner({ preset, onDismiss }: PresetBannerProps) {
  return (
    <div
      className="mb-[var(--spacing-8)] px-[var(--spacing-6)] py-[var(--spacing-4)] bg-[var(--color-accent-soft)] border border-[var(--color-rule)] rounded-[var(--radius-md)] flex items-start gap-[var(--spacing-4)]"
      role="note"
      aria-label="Active preset banner"
    >
      <div className="flex-1">
        <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.1em] text-[var(--color-accent-text)] mb-[var(--spacing-1)]">
          {"// Preset"}
        </p>
        <h3 className="font-[family-name:var(--font-display)] text-[length:var(--text-lg)] font-semibold text-[var(--color-text)] mb-[var(--spacing-2)]">
          {preset.title}
        </h3>
        {/* Body copy is --color-text (not --color-text-muted) because the
            accent-soft banner bg makes muted text come in at 4.31:1 — under
            AA. Primary text on the same bg clears 12:1. */}
        <p className="font-[family-name:var(--font-body)] text-[length:var(--text-sm)] leading-[1.6] text-[var(--color-text)] mb-[var(--spacing-2)]">
          {preset.description}
        </p>
        <p className="font-[family-name:var(--font-body)] text-[length:var(--text-sm)] leading-[1.6] italic text-[var(--color-text)]">
          {preset.rhetoricalPoint}
        </p>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss preset"
        className="font-[family-name:var(--font-display)] text-[length:var(--text-lg)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors duration-[var(--duration-fast)] cursor-pointer flex-shrink-0 leading-none px-[var(--spacing-2)]"
      >
        ×
      </button>
    </div>
  );
}
