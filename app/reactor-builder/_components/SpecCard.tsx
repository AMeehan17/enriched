"use client";

import type {
  ReactorTaxonomy,
  FuelId,
  CoolantId,
  XFactorId,
} from "@/lib/reactor-types";
import { ShareButton } from "./ShareButton";

interface SpecCardProps {
  taxonomy: ReactorTaxonomy;
  fuel: FuelId[];
  coolant: CoolantId[];
  xFactor: XFactorId[];
  matchCount: number;
  totalReactors: number;
  hasAnySelection: boolean;
  onClearAll: () => void;
}

/**
 * SpecCard — the sticky "your reactor" panel that updates live as the
 * user picks chips.
 *
 * Desktop (≥880px): renders as a sticky card in the right column of the
 * builder grid. Width ~360px, sticky top with a small offset.
 *
 * Mobile (<880px): in the ReactorBuilderView layout, this card stacks
 * below the steps. A separate sticky summary bar would render at the
 * viewport top, but for v1 we keep the simpler stack pattern — the user
 * sees their config below the configurator as they scroll, and the
 * match list below that. The sticky-bar-on-mobile feature lives in
 * TODOS for v1.1 if the simpler pattern doesn't work in dogfood.
 *
 * role="status" + aria-live="polite" so screen readers announce updates
 * as the user toggles chips.
 */
export function SpecCard({
  taxonomy,
  fuel,
  coolant,
  xFactor,
  matchCount,
  totalReactors,
  hasAnySelection,
  onClearAll,
}: SpecCardProps) {
  const fuelLabels = fuel.map((id) =>
    taxonomy.fuelTags.find((t) => t.id === id)?.label ?? id,
  );
  const coolantLabels = coolant.map((id) =>
    taxonomy.coolantTags.find((t) => t.id === id)?.label ?? id,
  );
  const xFactorLabels = xFactor.map((id) =>
    taxonomy.xFactorTags.find((t) => t.id === id)?.label ?? id,
  );

  const displayedMatchCount = hasAnySelection ? matchCount : totalReactors;
  const matchLabel = hasAnySelection
    ? "matching designs"
    : "total designs";

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label="Your reactor configuration"
      className="sticky top-[var(--spacing-6)] bg-[var(--color-surface)] border border-[var(--color-rule)] rounded-[var(--radius-md)] p-[var(--spacing-6)]"
    >
      <header className="flex items-baseline justify-between pb-[var(--spacing-4)] border-b border-[var(--color-rule)]">
        <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)] m-0">
          {"/ Your reactor"}
        </p>
        <div className="flex items-baseline gap-[var(--spacing-2)]">
          <span className="font-[family-name:var(--font-mono)] text-[length:var(--text-xl)] font-medium text-[var(--color-accent-text)] tabular-nums">
            {displayedMatchCount}
          </span>
          <span className="font-[family-name:var(--font-body)] text-[length:var(--text-sm)] text-[var(--color-text-muted)]">
            of {totalReactors}
          </span>
        </div>
      </header>

      <Row label="Fuel" values={fuelLabels} />
      <Row label="Coolant" values={coolantLabels} />
      <Row label="X-Factor" values={xFactorLabels} />

      <footer className="mt-[var(--spacing-4)] pt-[var(--spacing-4)] border-t border-[var(--color-rule)]">
        <p className="font-[family-name:var(--font-body)] text-[length:var(--text-sm)] text-[var(--color-text-muted)] m-0 leading-[1.5]">
          {hasAnySelection
            ? matchCount === 0
              ? "No current designs match this combination."
              : `${matchLabel}.`
            : "Showing every reactor. Pick a fuel to narrow the field."}
        </p>
        {hasAnySelection ? (
          <div className="mt-[var(--spacing-3)] flex items-baseline justify-between gap-[var(--spacing-3)]">
            <button
              onClick={onClearAll}
              className="font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-[var(--duration-fast)] cursor-pointer -ml-[12px] px-[var(--spacing-3)] py-[var(--spacing-2)] bg-transparent border-0"
            >
              <span aria-hidden="true" className="text-[var(--color-accent)]">
                ×{" "}
              </span>
              Clear all
            </button>
            <ShareButton hasAnySelection={hasAnySelection} />
          </div>
        ) : null}
      </footer>
    </aside>
  );
}

function Row({
  label,
  values,
}: {
  label: string;
  values: string[];
}) {
  const hasValues = values.length > 0;
  return (
    <div className="py-[var(--spacing-4)] border-b border-[var(--color-rule)] last-of-type:border-b-0">
      <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)] m-0 mb-[var(--spacing-2)]">
        {label}
      </p>
      {hasValues ? (
        <ul className="flex flex-wrap gap-[var(--spacing-2)] list-none m-0 p-0">
          {values.map((v) => (
            <li
              key={v}
              className="flex items-baseline gap-[var(--spacing-2)] font-[family-name:var(--font-display)] text-[length:var(--text-base)] font-medium tracking-[-0.01em]"
            >
              <span
                aria-hidden="true"
                className="inline-block w-[6px] h-[6px] rounded-full bg-[var(--color-accent)]"
              />
              {v}
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-[family-name:var(--font-display)] text-[length:var(--text-lg)] text-[var(--color-text-faint)] m-0">
          —
        </p>
      )}
    </div>
  );
}
