"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryStates } from "nuqs";
import type { Source, Preset, SourceId, NormalizeOption } from "@/lib/data-types";
import { sourcesParser, normalizeParser, presetParser, yearParser } from "@/lib/url-state";
import { DEFAULT_YEAR } from "@/lib/data-types";
import { SourcePills } from "./SourcePills";
import { NormalizeDropdown } from "./NormalizeDropdown";
import { ChartGrid } from "./ChartGrid";
import { PresetPills } from "./PresetPills";
import { PresetBanner } from "./PresetBanner";
import { YearSlider } from "./YearSlider";

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
  // All URL params managed atomically via useQueryStates.
  // Batching matters: when a preset is applied, sources + normalize + preset
  // must update in a single navigation so the URL is never in an inconsistent
  // intermediate state.
  const [urlState, setUrlState] = useQueryStates({
    sources: sourcesParser,
    normalize: normalizeParser,
    preset: presetParser,
    year: yearParser,
  });

  const selectedSources = urlState.sources;
  const normalizeBaseline = urlState.normalize;
  const activePresetSlug = urlState.preset;
  const year = urlState.year;

  const toggleSource = useCallback(
    (id: SourceId) => {
      void setUrlState((prev) => {
        const current = prev.sources ?? [];
        const nextSources = current.includes(id)
          ? current.filter((s) => s !== id)
          : [...current, id];

        // Keep the baseline in sync with the selection. The mental model is
        // "the black / full-opacity source is the benchmark" — if that source
        // leaves the set, the benchmark has to move. If we drop to a single
        // source, there's nothing meaningful to compare against, so baseline
        // collapses to "none". Going from 1 → 2+ sources auto-picks the first
        // as the benchmark so the user gets immediate ×N multiples.
        const prevBaseline = prev.normalize ?? "none";
        let nextBaseline: NormalizeOption = prevBaseline;

        if (nextSources.length < 2) {
          nextBaseline = "none";
        } else if (
          prevBaseline !== "none" &&
          !nextSources.includes(prevBaseline as SourceId)
        ) {
          nextBaseline = nextSources[0] as NormalizeOption;
        } else if (prevBaseline === "none") {
          nextBaseline = nextSources[0] as NormalizeOption;
        }

        // Manually toggling a pill clears any active preset because the
        // state no longer matches the preset's canonical configuration.
        return { sources: nextSources, normalize: nextBaseline, preset: "" };
      });
    },
    [setUrlState],
  );

  const handleBaselineChange = useCallback(
    (baseline: NormalizeOption) => {
      void setUrlState({ normalize: baseline, preset: "" });
    },
    [setUrlState],
  );

  const handlePresetClick = useCallback(
    (preset: Preset) => {
      void setUrlState({
        sources: [...preset.sources],
        normalize: preset.normalize,
        preset: preset.slug,
        year: preset.year,
      });
    },
    [setUrlState],
  );

  const handleYearChange = useCallback(
    (nextYear: number) => {
      // Year changes don't clear the preset — the time machine works
      // alongside preset comparisons.
      void setUrlState({ year: nextYear });
    },
    [setUrlState],
  );

  const clearPreset = useCallback(() => {
    void setUrlState({ preset: "" });
  }, [setUrlState]);

  const activePreset = activePresetSlug
    ? presets.find((p) => p.slug === activePresetSlug)
    : undefined;

  // Hydrate from preset on mount. If a user lands on /compare?preset=X with
  // no other params, apply the preset's full state. This makes preset URLs
  // work as "rebuttal-in-a-link" even when only the preset param is present.
  //
  // Runs exactly once on mount. We track via a ref so React strict mode
  // double-invocation and subsequent renders don't re-apply.
  const hydratedFromPresetRef = useRef(false);
  useEffect(() => {
    if (hydratedFromPresetRef.current) return;
    hydratedFromPresetRef.current = true;

    if (!activePreset) return;

    // Only auto-apply if sources + normalize are still at defaults.
    // If the user already has a custom state, don't clobber it.
    const url = new URL(window.location.href);
    const hasSourcesParam = url.searchParams.has("sources");
    const hasNormalizeParam = url.searchParams.has("normalize");

    if (!hasSourcesParam && !hasNormalizeParam) {
      void setUrlState({
        sources: [...activePreset.sources],
        normalize: activePreset.normalize,
        preset: activePreset.slug,
      });
    }
    // intentionally empty deps — this is a mount-only hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve selected IDs to Source objects, then hoist the baseline to the
  // top so the "first bar = benchmark" invariant holds visually. The URL
  // order is preserved for non-baseline sources; we only move the baseline.
  const activeSources = useMemo<ReadonlyArray<Source>>(() => {
    const resolved = (selectedSources ?? [])
      .map((id) => sources.find((s) => s.id === id))
      .filter((s): s is Source => s !== undefined);

    if (normalizeBaseline === "none" || normalizeBaseline == null) return resolved;

    const baselineIdx = resolved.findIndex((s) => s.id === normalizeBaseline);
    if (baselineIdx <= 0) return resolved;

    const reordered = [...resolved];
    const [baseline] = reordered.splice(baselineIdx, 1);
    if (baseline) reordered.unshift(baseline);
    return reordered;
  }, [selectedSources, normalizeBaseline, sources]);

  return (
    <div>
      {/* Section header — stacks on mobile, splits to 1fr/2fr columns on sm+ */}
      <div className="border-t border-[var(--color-rule-strong)] pt-[var(--spacing-6)] mb-[var(--spacing-8)] sm:mb-[var(--spacing-12)] grid gap-[var(--spacing-4)] sm:gap-[var(--spacing-12)] [grid-template-columns:1fr] sm:[grid-template-columns:1fr_2fr]">
        <div>
          <p className="font-[family-name:var(--font-display)] text-[length:var(--text-xs)] font-medium uppercase tracking-[0.05em] text-[var(--color-accent)]">
            {"// Energy Source Comparison"}
          </p>
          <h2
            id="comparison-title"
            className="font-[family-name:var(--font-display)] text-[length:var(--text-xl)] sm:text-[length:var(--text-2xl)] font-medium tracking-[-0.015em] leading-[1.15] text-[var(--color-text)] mt-[var(--spacing-2)]"
          >
            Six sources, eight dimensions, one honest picture.
          </h2>
        </div>
        <p className="font-[family-name:var(--font-body)] text-[length:var(--text-base)] sm:text-[length:var(--text-lg)] leading-[1.6] text-[var(--color-text-muted)] sm:self-end">
          Pick which energy sources to compare. Pick which one to normalize
          against (or none). Every value is cited from IEA, IAEA, Lazard,
          OWID, or IPCC.
        </p>
      </div>

      {/* Preset banner (visible only when a preset is active) */}
      {activePreset && (
        <PresetBanner preset={activePreset} onDismiss={clearPreset} />
      )}

      {/* Toolbar */}
      <div className="mb-[var(--spacing-8)]">
        <PresetPills
          presets={presets}
          activeSlug={activePresetSlug ?? ""}
          onPresetClick={handlePresetClick}
        />

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

        <YearSlider
          year={year ?? DEFAULT_YEAR}
          onYearChange={handleYearChange}
        />
      </div>

      {/* Screen-reader announcement of current state. Updates silently in
          the DOM; assistive tech reads it aloud on change (polite so it
          doesn't interrupt an in-flight utterance). Covers the three knobs
          a keyboard user spins: sources, baseline, year. */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {activeSources.length === 0
          ? "No sources selected."
          : `Showing ${activeSources.map((s) => s.label).join(", ")} for ${year ?? DEFAULT_YEAR}${
              normalizeBaseline && normalizeBaseline !== "none"
                ? `, normalized to ${sources.find((s) => s.id === normalizeBaseline)?.label ?? normalizeBaseline}`
                : ""
            }.`}
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
          year={year ?? DEFAULT_YEAR}
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
