"use client";

import type {
  ReactorTaxonomy,
  FuelMaterialId,
  KickstarterId,
  FuelFormId,
  CoolantId,
  CoolantChemistryId,
  XFactorId,
} from "@/lib/reactor-types";
import { ShareButton } from "./ShareButton";

interface SpecCardProps {
  taxonomy: ReactorTaxonomy;
  fuelMaterial: FuelMaterialId | null;
  kickstarter: KickstarterId | null;
  fuelForm: FuelFormId | null;
  coolant: CoolantId[];
  coolantChemistry: CoolantChemistryId[];
  xFactor: XFactorId[];
  /** Used to split xFactor into Size vs Capability rows. */
  scaleIdSet: ReadonlySet<string>;
  matchCount: number;
  totalReactors: number;
  hasAnySelection: boolean;
  onClearAll: () => void;
}

/**
 * SpecCard — sticky "your reactor" panel that updates live.
 *
 * Schema v3: shows single-value dimensions (fuel, kickstarter, fuel form)
 * as their own rows, plus array dimensions (coolant, chemistry, size,
 * capability) as pill lists. Size and capability both live in the xFactor
 * array — we partition using the scale tag set passed down from the view.
 *
 * role="status" + aria-live="polite" so screen readers announce updates.
 */
export function SpecCard({
  taxonomy,
  fuelMaterial,
  kickstarter,
  fuelForm,
  coolant,
  coolantChemistry,
  xFactor,
  scaleIdSet,
  matchCount,
  totalReactors,
  hasAnySelection,
  onClearAll,
}: SpecCardProps) {
  const feLabel = fuelMaterial
    ? taxonomy.fuelMaterialTags.find((t) => t.id === fuelMaterial)?.label ??
      fuelMaterial
    : null;
  const ksLabel = kickstarter
    ? taxonomy.kickstarterTags.find((t) => t.id === kickstarter)?.label ??
      kickstarter
    : null;
  const ffLabel = fuelForm
    ? taxonomy.fuelFormTags.find((t) => t.id === fuelForm)?.label ?? fuelForm
    : null;
  const coolantLabels = coolant.map(
    (id) => taxonomy.coolantTags.find((t) => t.id === id)?.label ?? id,
  );
  const chemistryLabels = coolantChemistry.map(
    (id) =>
      taxonomy.coolantChemistryTags.find((t) => t.id === id)?.label ?? id,
  );
  const sizeLabels = xFactor
    .filter((id) => scaleIdSet.has(id))
    .map((id) => taxonomy.xFactorTags.find((t) => t.id === id)?.label ?? id);
  const capabilityLabels = xFactor
    .filter((id) => !scaleIdSet.has(id))
    .map((id) => taxonomy.xFactorTags.find((t) => t.id === id)?.label ?? id);

  const displayedMatchCount = hasAnySelection ? matchCount : totalReactors;

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

      <SingleRow label="Fuel" value={feLabel} />
      {kickstarter !== null ? (
        <SingleRow label="Kickstarter" value={ksLabel} />
      ) : null}
      <SingleRow label="Fuel form" value={ffLabel} />
      <MultiRow label="Coolant" values={coolantLabels} />
      {chemistryLabels.length > 0 ? (
        <MultiRow label="Chemistry" values={chemistryLabels} />
      ) : null}
      <MultiRow label="Size" values={sizeLabels} />
      <MultiRow label="Capability" values={capabilityLabels} />

      <footer className="mt-[var(--spacing-4)] pt-[var(--spacing-4)] border-t border-[var(--color-rule)]">
        <p className="font-[family-name:var(--font-body)] text-[length:var(--text-sm)] text-[var(--color-text-muted)] m-0 leading-[1.5]">
          {hasAnySelection
            ? matchCount === 0
              ? "No current designs match this combination."
              : "Matching designs."
            : "Showing every reactor. Start with a fuel to narrow the field."}
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

function SingleRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="py-[var(--spacing-4)] border-b border-[var(--color-rule)]">
      <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)] m-0 mb-[var(--spacing-2)]">
        {label}
      </p>
      {value ? (
        <p className="flex items-baseline gap-[var(--spacing-2)] font-[family-name:var(--font-display)] text-[length:var(--text-base)] font-medium tracking-[-0.01em] m-0">
          <span
            aria-hidden="true"
            className="inline-block w-[6px] h-[6px] rounded-full bg-[var(--color-accent)]"
          />
          {value}
        </p>
      ) : (
        <p className="font-[family-name:var(--font-display)] text-[length:var(--text-lg)] text-[var(--color-text-faint)] m-0">
          —
        </p>
      )}
    </div>
  );
}

function MultiRow({
  label,
  values,
}: {
  label: string;
  values: string[];
}) {
  return (
    <div className="py-[var(--spacing-4)] border-b border-[var(--color-rule)] last-of-type:border-b-0">
      <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)] m-0 mb-[var(--spacing-2)]">
        {label}
      </p>
      {values.length > 0 ? (
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
