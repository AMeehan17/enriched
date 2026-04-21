"use client";

import type {
  CoolantId,
  FuelFormId,
  FuelMaterialId,
  KickstarterId,
  XFactorId,
} from "@/lib/reactor-types";

export interface PresetConfig {
  fe: FuelMaterialId | null;
  ks: KickstarterId | null;
  ff: FuelFormId | null;
  c: CoolantId[];
  x: XFactorId[];
}

interface PresetLinksProps {
  onPreset: (config: PresetConfig) => void;
}

/**
 * PresetLinks — 4 curated entry points into the reactor builder.
 *
 * Each preset pre-fills a complete reactor recipe (fuel + form + coolant +
 * x-factor) so the match list shows a concrete design when clicked. The
 * user iterates from there by toggling chips.
 *
 * Each preset frames a different teaching story:
 *   - walk-away-safe sodium fast reactor → Natrium archetype
 *     (passive safety as a coolant decision)
 *   - process-heat pebble bed → Xe-100 / KP-FHR archetype
 *     (nuclear for industrial heat)
 *   - thorium molten-salt breeder → Copenhagen Atomics archetype
 *     (breeding multiplies fuel from fertile isotopes)
 *   - licensed small modular LWR → VOYGR archetype
 *     (the SMR path regulators already know)
 */

interface Preset {
  label: string;
  config: PresetConfig;
  hint: string;
}

const PRESETS: readonly Preset[] = [
  {
    label: "Walk-away-safe fast reactor",
    config: {
      fe: "u-235",
      ks: null,
      ff: "metal",
      c: ["sodium"],
      x: ["walk-away-safe"],
    },
    hint: "Passive safety as a coolant decision — the Natrium archetype",
  },
  {
    label: "Process-heat pebble bed",
    config: {
      fe: "u-235",
      ks: null,
      ff: "triso",
      c: ["helium"],
      x: ["process-heat"],
    },
    hint: "Industrial heat, not just electricity — the Xe-100 archetype",
  },
  {
    label: "Thorium molten-salt breeder",
    config: {
      fe: "th-232",
      ks: "u-235-kickstart",
      ff: "molten-salt",
      c: ["flibe"],
      x: ["fuel-breeder"],
    },
    hint: "Breeding fuel from fertile isotopes — the Copenhagen Atomics archetype",
  },
  {
    label: "Licensed small modular LWR",
    config: {
      fe: "u-235",
      ks: null,
      ff: "ceramic-pellets",
      c: ["light-water"],
      x: ["small", "first-of-kind-licensed"],
    },
    hint: "The SMR path regulators already know — the VOYGR archetype",
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
          <li key={preset.label}>
            <button
              onClick={() => onPreset(preset.config)}
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
