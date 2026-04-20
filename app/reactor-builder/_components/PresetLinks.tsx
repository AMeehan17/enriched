"use client";

import type { XFactorId } from "@/lib/reactor-types";

interface PresetLinksProps {
  onPreset: (xFactor: XFactorId[]) => void;
}

/**
 * PresetLinks — 4 curated entry points into the reactor builder.
 *
 * Each preset clears fuel + coolant selections and sets a specific
 * X-Factor capability tag. The accompanying match list then surfaces
 * the real-world designs that fit that single capability.
 *
 * Per the CEO review: each preset frames a different teaching story.
 * - walk-away-safe: the safety reframe (modern passive safety is a
 *   coolant decision, not a bolt-on safety system)
 * - process-heat: the application reframe (nuclear isn't just
 *   electricity — it's industrial heat for hydrogen, steel, cement)
 * - micro: the scale reframe (reactors can be truck-sized)
 * - fuel-breeder: the fuel-cycle reframe (breeding multiplies
 *   effective fuel supply)
 */

interface Preset {
  label: string;
  xFactor: XFactorId;
  hint: string;
}

const PRESETS: readonly Preset[] = [
  {
    label: "Walk-away-safe reactors",
    xFactor: "walk-away-safe",
    hint: "Why passive safety is a coolant decision",
  },
  {
    label: "Process heat reactors",
    xFactor: "process-heat",
    hint: "Nuclear for industrial heat, not just electricity",
  },
  {
    label: "Micro reactors",
    xFactor: "micro",
    hint: "Truck-sized, factory-built, remote-deployable",
  },
  {
    label: "Fuel breeders",
    xFactor: "fuel-breeder",
    hint: "Multiplying fuel supply from fertile isotopes",
  },
] as const;

export function PresetLinks({ onPreset }: PresetLinksProps) {
  return (
    <div className="border-t border-[var(--color-rule)] pt-[var(--spacing-6)] pb-[var(--spacing-2)]">
      <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.1em] text-[var(--color-text-muted)] mb-[var(--spacing-3)]">
        {"/ Start here"}
      </p>
      <ul className="flex flex-wrap gap-x-[var(--spacing-6)] gap-y-[var(--spacing-2)] list-none m-0 p-0">
        {PRESETS.map((preset) => (
          <li key={preset.xFactor}>
            <button
              onClick={() => onPreset([preset.xFactor])}
              className="font-[family-name:var(--font-body)] text-[length:var(--text-base)] text-[var(--color-accent-text)] hover:text-[var(--color-accent)] hover:underline transition-colors duration-[var(--duration-fast)] text-left cursor-pointer"
              title={preset.hint}
            >
              {preset.label} <span aria-hidden="true">↗</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
