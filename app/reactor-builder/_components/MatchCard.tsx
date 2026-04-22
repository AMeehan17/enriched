"use client";

import { useState } from "react";
import type {
  ReactorDesign,
  ReactorTaxonomy,
  FuelMaterialId,
  KickstarterId,
  FuelFormId,
  CoolantId,
  CoolantChemistryId,
  SpectrumId,
  XFactorId,
} from "@/lib/reactor-types";

interface MatchCardProps {
  reactor: ReactorDesign;
  taxonomy: ReactorTaxonomy;
  selectedFuelElement: FuelMaterialId | null;
  selectedKickstarter: KickstarterId | null;
  selectedFuelForm: FuelFormId | null;
  selectedCoolant: CoolantId[];
  selectedCoolantChemistry: CoolantChemistryId[];
  selectedSpectrum: SpectrumId | null;
  selectedXFactor: XFactorId[];
}

/**
 * MatchCard — one reactor design in the match list.
 *
 * Schema v2: renders fuel as element + kickstarter (if present) + form,
 * shows reactorType as a prominent derived field, tag pills highlight
 * matched selections in accent-soft.
 */
export function MatchCard({
  reactor,
  taxonomy,
  selectedFuelElement,
  selectedKickstarter,
  selectedFuelForm,
  selectedCoolant,
  selectedCoolantChemistry,
  selectedSpectrum,
  selectedXFactor,
}: MatchCardProps) {
  const [whyOpen, setWhyOpen] = useState(false);

  const feTag = taxonomy.fuelMaterialTags.find(
    (t) => t.id === reactor.fuelMaterial,
  );
  const ksTag = reactor.kickstarter
    ? taxonomy.kickstarterTags.find((t) => t.id === reactor.kickstarter)
    : null;
  const ffTag = taxonomy.fuelFormTags.find((t) => t.id === reactor.fuelForm);
  const coolantTagMap = new Map(taxonomy.coolantTags.map((t) => [t.id, t]));
  const chemistryTagMap = new Map(
    taxonomy.coolantChemistryTags.map((t) => [t.id, t]),
  );
  const spectrumTag = taxonomy.spectrumTags.find(
    (t) => t.id === reactor.spectrum,
  );
  const xTagMap = new Map(taxonomy.xFactorTags.map((t) => [t.id, t]));

  const selectedCoolantSet = new Set<string>(selectedCoolant);
  const selectedChemistrySet = new Set<string>(selectedCoolantChemistry);
  const selectedXSet = new Set<string>(selectedXFactor);
  const chemistryTag = reactor.coolantChemistry
    ? chemistryTagMap.get(reactor.coolantChemistry)
    : null;

  const fuelMaterialMatched = selectedFuelElement === reactor.fuelMaterial;
  const kickstarterMatched =
    selectedKickstarter !== null && selectedKickstarter === reactor.kickstarter;
  const fuelFormMatched = selectedFuelForm === reactor.fuelForm;
  const spectrumMatched =
    selectedSpectrum !== null && selectedSpectrum === reactor.spectrum;

  return (
    <article className="border-t border-[var(--color-rule)] py-[var(--spacing-8)] last:border-b last:border-[var(--color-rule)] grid grid-cols-1 gap-[var(--spacing-6)]">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-[var(--spacing-6)] items-start">
        <div>
          <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.08em] text-[var(--color-text-faint)] m-0 mb-[var(--spacing-2)]">
            Pursued by{" "}
            {reactor.pursuedBy.map((p, i) => (
              <span key={p.url}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-text)] transition-colors duration-[var(--duration-fast)] no-underline"
                >
                  {p.name} <span aria-hidden="true">↗</span>
                </a>
                {i < reactor.pursuedBy.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
          <h4 className="font-[family-name:var(--font-display)] text-[length:var(--text-xl)] font-medium tracking-[-0.02em] m-0 mb-[var(--spacing-2)]">
            {reactor.name}
          </h4>
          <p className="font-[family-name:var(--font-body)] text-[length:var(--text-base)] text-[var(--color-text-muted)] leading-[1.55] max-w-[560px] m-0">
            {reactor.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-[var(--spacing-3)_var(--spacing-6)] sm:grid-cols-[repeat(3,auto)] border-t border-b border-[var(--color-rule)] py-[var(--spacing-3)] self-start">
          <SpecCol label="Type" value={reactor.reactorType} />
          <SpecCol label="Outlet" value={`${reactor.outletTempC}°C`} />
          <SpecCol label="Spectrum" value={reactor.spectrum} />
        </div>
      </div>

      {/* Tag pills */}
      <div className="flex flex-wrap gap-[var(--spacing-2)]">
        {feTag ? (
          <TagPill label={feTag.label} matched={fuelMaterialMatched} />
        ) : null}
        {ksTag ? (
          <TagPill label={ksTag.label} matched={kickstarterMatched} />
        ) : null}
        {ffTag ? (
          <TagPill label={ffTag.label} matched={fuelFormMatched} />
        ) : null}
        {reactor.coolantTags.map((id) => {
          const tag = coolantTagMap.get(id);
          return (
            <TagPill
              key={id}
              label={tag?.label ?? id}
              matched={selectedCoolantSet.has(id)}
            />
          );
        })}
        {chemistryTag ? (
          <TagPill
            label={chemistryTag.label}
            matched={selectedChemistrySet.has(chemistryTag.id)}
          />
        ) : null}
        {spectrumTag ? (
          <TagPill label={spectrumTag.label} matched={spectrumMatched} />
        ) : null}
        {reactor.xFactorTags.map((id) => {
          const tag = xTagMap.get(id);
          return (
            <TagPill
              key={id}
              label={tag?.label ?? id}
              matched={selectedXSet.has(id)}
            />
          );
        })}
      </div>

      {/* Why this design? expandable logic chain */}
      <div className="border-t border-[var(--color-rule)] pt-[var(--spacing-4)]">
        <button
          onClick={() => setWhyOpen((prev) => !prev)}
          aria-expanded={whyOpen}
          className="flex items-center gap-[var(--spacing-3)] font-[family-name:var(--font-display)] text-[length:var(--text-sm)] font-medium text-[var(--color-text)] hover:text-[var(--color-accent-text)] transition-colors duration-[var(--duration-fast)] cursor-pointer bg-transparent border-0 p-0 py-[var(--spacing-2)] w-full"
        >
          <span
            aria-hidden="true"
            className="text-[var(--color-accent)] text-[14px] w-[16px] text-center inline-block"
          >
            {whyOpen ? "−" : "+"}
          </span>
          <span>Why this design?</span>
          <span className="ml-auto font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] font-normal text-[var(--color-text-faint)] tabular-nums">
            {reactor.whyChain.length} step{reactor.whyChain.length === 1 ? "" : "s"}
          </span>
        </button>
        {whyOpen ? (
          <ol className="list-none m-0 p-0 mt-[var(--spacing-4)] grid grid-cols-[auto_1fr] gap-x-[var(--spacing-4)] gap-y-[var(--spacing-3)]">
            {reactor.whyChain.map((step, i) => (
              <li key={i} className="contents">
                <span
                  className="font-[family-name:var(--font-mono)] text-[length:var(--text-xs)] text-[var(--color-text-faint)] tabular-nums pt-[4px]"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-[family-name:var(--font-body)] text-[length:var(--text-base)] leading-[1.55] text-[var(--color-text)] m-0 pb-[var(--spacing-3)] border-b border-[var(--color-rule)] last:border-b-0 last:pb-0 max-w-[680px]">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </article>
  );
}

function SpecCol({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-[var(--spacing-1)]">
      <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)] m-0 mb-[2px]">
        {label}
      </p>
      <p className="font-[family-name:var(--font-mono)] text-[length:var(--text-base)] font-medium tabular-nums m-0">
        {value}
      </p>
    </div>
  );
}

function TagPill({ label, matched }: { label: string; matched: boolean }) {
  return (
    <span
      className={`inline-block font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium px-[var(--spacing-2)] py-[3px] border rounded-[var(--radius-pill)] whitespace-nowrap leading-[1.3] ${
        matched
          ? "bg-[var(--color-accent-soft)] border-[var(--color-accent-soft)] text-[var(--color-accent-text)]"
          : "bg-[var(--color-surface)] border-[var(--color-rule-strong)] text-[var(--color-text)]"
      }`}
    >
      {label}
    </span>
  );
}
