"use client";

import { useCallback } from "react";
import { useQueryState } from "nuqs";
import type { Source, Preset, SourceId, NormalizeOption } from "@/lib/data-types";
import { sourcesParser, normalizeParser } from "@/lib/url-state";
import { SourcePills } from "./SourcePills";
import { NormalizeDropdown } from "./NormalizeDropdown";
import { ChartGrid } from "./ChartGrid";

/**
 * ComparisonView — the client root that owns all interactive state.
 *
 * URL is the source of truth via nuqs. Toggle a pill → URL updates →
 * bars re-render. Bookmarkable, shareable, OG-image-renderable.
 *
 * Server/client boundary: everything above (page.tsx) is server.
 * Everything below (pills, dropdown, charts) reads state from here.
 */

interface ComparisonViewProps {
  sources: ReadonlyArray<Source>;
  presets: ReadonlyArray<Preset>;
}

export function ComparisonView({ sources, presets }: ComparisonViewProps) {
  const [selectedSources, setSelectedSources] = useQueryState(
    "sources",
    sourcesParser,
  );
  const [normalizeBaseline, setNormalizeBaseline] = useQueryState(
    "normalize",
    normalizeParser,
  );

  const toggleSource = useCallback(
    (id: SourceId) => {
      void setSelectedSources((prev) => {
        const current = prev ?? [];
        if (current.includes(id)) {
          return current.filter((s) => s !== id);
        }
        return [...current, id];
      });
    },
    [setSelectedSources],
  );

  const handleBaselineChange = useCallback(
    (baseline: NormalizeOption) => {
      void setNormalizeBaseline(baseline);
    },
    [setNormalizeBaseline],
  );

  // Get the Source objects for the selected IDs, preserving selection order
  const activeSources = (selectedSources ?? [])
    .map((id) => sources.find((s) => s.id === id))
    .filter((s): s is Source => s !== undefined);

  return (
    <div>
      {/* Section header */}
      <div
        className="border-t border-[var(--color-rule-strong)] pt-[var(--spacing-6)] mb-[var(--spacing-12)]"
        style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--spacing-12)" }}
      >
        <div>
          <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.05em] text-[var(--color-accent)]">
            {"// Energy Source Comparison"}
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-[length:var(--text-2xl)] font-medium tracking-[-0.015em] leading-[1.15] text-[var(--color-text)] mt-[var(--spacing-2)]">
            Six sources, eight dimensions, one honest picture.
          </h2>
        </div>
        <p className="font-[family-name:var(--font-body)] text-[length:var(--text-lg)] leading-[1.6] text-[var(--color-text-muted)] self-end">
          Pick which energy sources to compare. Pick which one to normalize
          against (or none). Every value is cited from IEA, IAEA, Lazard,
          OWID, or IPCC.
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-[var(--spacing-8)]">
        <SourcePills
          sources={sources}
          selected={selectedSources ?? []}
          onToggle={toggleSource}
        />

        <NormalizeDropdown
          sources={sources}
          selected={selectedSources ?? []}
          baseline={normalizeBaseline ?? "none"}
          onBaselineChange={handleBaselineChange}
        />
      </div>

      {/* Chart grid */}
      {activeSources.length === 0 ? (
        <div className="py-[var(--spacing-16)] text-center">
          <p className="font-[family-name:var(--font-display)] text-[length:var(--text-lg)] text-[var(--color-text-muted)]">
            Select at least one energy source to compare.
          </p>
        </div>
      ) : (
        <ChartGrid
          sources={activeSources}
          allSources={sources}
          normalizeBaseline={normalizeBaseline ?? "none"}
        />
      )}

      {/* Sources footer */}
      <div className="mt-[var(--spacing-16)] pt-[var(--spacing-6)] border-t border-[var(--color-rule)]">
        <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.1em] text-[var(--color-text-faint)] mb-[var(--spacing-3)]">
          {"/ Data Sources"}
        </p>
        <p className="font-[family-name:var(--font-body)] text-[length:var(--text-sm)] leading-[1.7] text-[var(--color-text-muted)]">
          Capacity factor: EIA Electric Power Monthly (2024).
          Land use: Blomqvist et al. 2022 (PLoS ONE).
          Lifecycle CO₂: IPCC AR5 WG3 Annex III.
          Deaths: Our World in Data / Markandya &amp; Wilkinson / Sovacool.
          LCOE: Lazard LCOE+ v17.0 (2024). Hydro LCOE: NREL ATB 2024.
          Energy density: World Nuclear Association.
          Last updated 2026-04-11.
        </p>
      </div>
    </div>
  );
}
