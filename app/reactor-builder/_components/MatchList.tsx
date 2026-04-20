"use client";

import type {
  ReactorTaxonomy,
  FissileElementId,
  KickstarterId,
  FuelFormId,
  CoolantId,
  XFactorId,
} from "@/lib/reactor-types";
import type { MatchResult } from "@/lib/reactor-match";
import { MatchCard } from "./MatchCard";

interface MatchListProps {
  taxonomy: ReactorTaxonomy;
  selectedFuelElement: FissileElementId | null;
  selectedKickstarter: KickstarterId | null;
  selectedFuelForm: FuelFormId | null;
  selectedCoolant: CoolantId[];
  selectedXFactor: XFactorId[];
  result: MatchResult;
  onClearAll: () => void;
}

export function MatchList({
  taxonomy,
  selectedFuelElement,
  selectedKickstarter,
  selectedFuelForm,
  selectedCoolant,
  selectedXFactor,
  result,
  onClearAll,
}: MatchListProps) {
  return (
    <section
      aria-labelledby="matches-title"
      className="border-t border-[var(--color-rule)] pt-[var(--spacing-12)] mt-[var(--spacing-12)]"
    >
      <header className="flex items-baseline justify-between gap-[var(--spacing-6)] flex-wrap mb-[var(--spacing-8)]">
        <h3
          id="matches-title"
          className="font-[family-name:var(--font-display)] text-[length:var(--text-xl)] sm:text-[length:var(--text-2xl)] font-medium tracking-[-0.02em] leading-[1.1] m-0"
        >
          Matching designs
        </h3>
        <p className="font-[family-name:var(--font-mono)] text-[length:var(--text-sm)] text-[var(--color-text-muted)] tabular-nums m-0">
          <span className="text-[var(--color-accent-text)] font-medium">
            {result.results.length}
          </span>{" "}
          {result.results.length === 1 ? "design" : "designs"}
        </p>
      </header>

      {result.noMatch ? (
        <div className="border border-[var(--color-rule)] rounded-[var(--radius-md)] p-[var(--spacing-8)] sm:p-[var(--spacing-12)] text-center">
          <h4 className="font-[family-name:var(--font-display)] text-[length:var(--text-lg)] font-medium tracking-[-0.015em] m-0 mb-[var(--spacing-2)]">
            No current designs match this combination.
          </h4>
          <p className="font-[family-name:var(--font-body)] text-[length:var(--text-base)] text-[var(--color-text-muted)] max-w-[440px] mx-auto mb-[var(--spacing-4)]">
            That doesn't mean it's impossible. Just that no one is building
            exactly this reactor right now. Try loosening a constraint.
          </p>
          <button
            onClick={onClearAll}
            className="font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors duration-[var(--duration-fast)] cursor-pointer bg-transparent border-0 underline decoration-dotted underline-offset-[4px]"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <ul className="list-none m-0 p-0">
          {result.results.map((r) => (
            <li key={r.id}>
              <MatchCard
                reactor={r}
                taxonomy={taxonomy}
                selectedFuelElement={selectedFuelElement}
                selectedKickstarter={selectedKickstarter}
                selectedFuelForm={selectedFuelForm}
                selectedCoolant={selectedCoolant}
                selectedXFactor={selectedXFactor}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
