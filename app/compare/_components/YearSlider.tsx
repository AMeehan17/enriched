"use client";

import { useCallback } from "react";
import { MIN_YEAR, MAX_YEAR } from "@/lib/data-types";

interface YearSliderProps {
  year: number;
  onYearChange: (year: number) => void;
  disabled?: boolean;
}

/**
 * YearSlider — the time machine.
 *
 * Drag the handle to move through 2010-2026. LCOE and capacity factor
 * bars animate to that year's values. Other dimensions show their
 * static current-year value regardless (honestly flagged: "this dimension
 * does not change year-over-year").
 *
 * Native <input type="range"> for accessibility. Arrow keys + Page Up/Down
 * work out of the box. Custom visual styling via CSS-only (no JS resize
 * observer nonsense).
 */
export function YearSlider({ year, onYearChange, disabled = false }: YearSliderProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number.parseInt(e.target.value, 10);
      if (!Number.isNaN(next)) onYearChange(next);
    },
    [onYearChange],
  );

  // Fill width as % of range, for the custom track indicator
  const fillPct = ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

  return (
    <div
      className={`
        mt-[var(--spacing-6)] px-[var(--spacing-6)] py-[var(--spacing-4)]
        bg-[var(--color-surface)] border border-[var(--color-rule)] rounded-[var(--radius-md)]
        ${disabled ? "opacity-50" : ""}
      `}
    >
      <div className="flex items-baseline justify-between mb-[var(--spacing-4)]">
        <span className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.1em] text-[var(--color-text-faint)]">
          {"/ Year"}
        </span>
        <span className="font-[family-name:var(--font-display)] text-[length:var(--text-xl)] font-semibold text-[var(--color-accent-text)] tabular-nums">
          {year}
        </span>
      </div>

      {/* Native slider + custom visual track */}
      <div className="relative">
        {/* Base track */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[4px] bg-[var(--color-rule)] rounded-[2px] pointer-events-none"
          aria-hidden="true"
        />
        {/* Fill */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[4px] bg-[var(--color-text)] rounded-[2px] pointer-events-none"
          style={{ width: `${fillPct}%` }}
          aria-hidden="true"
        />
        {/* Native range input (transparent, handle styled via accent-color) */}
        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          step={1}
          value={year}
          onChange={handleChange}
          disabled={disabled}
          aria-label="Year"
          aria-valuetext={year.toString()}
          aria-valuemin={MIN_YEAR}
          aria-valuemax={MAX_YEAR}
          className="relative w-full h-[20px] bg-transparent cursor-pointer disabled:cursor-not-allowed appearance-none year-slider-native"
          style={{ accentColor: "var(--color-accent)" }}
        />
      </div>

      <div className="flex justify-between mt-[var(--spacing-2)] font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-faint)] tabular-nums">
        <span>{MIN_YEAR}</span>
        <span>{MIN_YEAR + 4}</span>
        <span>{MIN_YEAR + 8}</span>
        <span>{MIN_YEAR + 12}</span>
        <span>{MAX_YEAR}</span>
      </div>

      {disabled && (
        <p className="mt-[var(--spacing-3)] font-[family-name:var(--font-body)] text-[length:var(--text-sm)] text-[var(--color-text-muted)] italic">
          This preset focuses on dimensions that don&apos;t vary year-over-year.
        </p>
      )}
    </div>
  );
}
