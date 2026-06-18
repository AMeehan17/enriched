"use client";

/**
 * <MaxwellBoltzmannSlider />
 *
 * The first interactive cell in Module 3: an SVG plot of two neutron-energy
 * distributions side by side — Maxwell–Boltzmann (thermal, controlled by a
 * temperature slider) and Watt (fast, fixed reference). Dragging the slider
 * shifts the M-B curve and shows that no realistic moderator temperature
 * brings the thermal spectrum anywhere near fast-spectrum energies.
 *
 * Visual contract (DESIGN.md):
 *   - Rust accent (--color-accent) for the active M-B curve.
 *   - Muted gray (--color-data-2) for the Watt reference.
 *   - Hairline gridlines at each decade. No icons.
 *   - Tabular nums on every rendered number.
 *
 * Accessibility:
 *   - Slider has aria-label + aria-valuetext describing the current
 *     temperature and corresponding peak energy in eV.
 *   - A textual summary directly below the plot mirrors the chart state
 *     for screen readers and as a teaching fallback.
 */

import { useId, useMemo, useState } from "react";
import {
  FAST_REFERENCE_EV,
  K_BOLTZMANN_EV_PER_K,
  THERMAL_REFERENCE_EV,
  logSpaced,
  maxwellBoltzmannDensity,
  maxwellBoltzmannPeakEnergy,
  samplePeakNormalized,
  wattFissionDensity,
} from "./spectrum-math";

// ─── Plot geometry (SVG viewBox-relative, scaled by CSS) ─────────────
const PLOT_W = 800;
const PLOT_H = 400;
const MARGIN = { top: 24, right: 36, bottom: 52, left: 60 };
const INNER_W = PLOT_W - MARGIN.left - MARGIN.right;
const INNER_H = PLOT_H - MARGIN.top - MARGIN.bottom;

// ─── Energy range (eV) — 11 decades, from cold to fast ───────────────
const E_MIN_EV = 1e-4;
const E_MAX_EV = 1e7;
const SAMPLE_COUNT = 240;

// Pre-computed once at module load: the sample energies + the Watt curve.
// Both are static (Watt doesn't depend on user state).
const ENERGIES_EV = logSpaced(E_MIN_EV, E_MAX_EV, SAMPLE_COUNT);
const WATT_SAMPLES = samplePeakNormalized(wattFissionDensity, ENERGIES_EV);

// ─── Axis helpers ────────────────────────────────────────────────────
const LOG_E_MIN = Math.log10(E_MIN_EV);
const LOG_E_MAX = Math.log10(E_MAX_EV);

function xCoord(E_eV: number): number {
  return (
    MARGIN.left +
    ((Math.log10(E_eV) - LOG_E_MIN) / (LOG_E_MAX - LOG_E_MIN)) * INNER_W
  );
}
function yCoord(y: number): number {
  return MARGIN.top + (1 - y) * INNER_H;
}

function buildPath(samples: ReadonlyArray<{ E_eV: number; y: number }>): string {
  if (samples.length === 0) return "";
  const points = samples.map(
    (s, i) => `${i === 0 ? "M" : "L"}${xCoord(s.E_eV).toFixed(2)},${yCoord(s.y).toFixed(2)}`,
  );
  return points.join(" ");
}

const WATT_PATH = buildPath(WATT_SAMPLES);

// Static gridlines and tick labels at each decade.
const DECADE_TICKS: ReadonlyArray<{ E_eV: number; label: string }> = [
  { E_eV: 1e-4, label: "10⁻⁴" },
  { E_eV: 1e-3, label: "10⁻³" },
  { E_eV: 1e-2, label: "10⁻²" },
  { E_eV: 1e-1, label: "10⁻¹" },
  { E_eV: 1, label: "1" },
  { E_eV: 1e1, label: "10" },
  { E_eV: 1e2, label: "10²" },
  { E_eV: 1e3, label: "10³" },
  { E_eV: 1e4, label: "10⁴" },
  { E_eV: 1e5, label: "10⁵" },
  { E_eV: 1e6, label: "10⁶" },
  { E_eV: 1e7, label: "10⁷" },
];

// ─── Slider config ───────────────────────────────────────────────────
const T_MIN_K = 100;
const T_MAX_K = 2000;
const T_DEFAULT_K = 293;

interface PresetT {
  T_K: number;
  label: string;
  blurb: string;
}

const PRESETS: ReadonlyArray<PresetT> = [
  { T_K: 293, label: "Room (293 K)", blurb: "Light water — textbook reference" },
  { T_K: 570, label: "PWR (570 K)", blurb: "Pressurized water reactor coolant" },
  { T_K: 900, label: "Molten salt (900 K)", blurb: "FLiBe-cooled designs" },
  { T_K: 1200, label: "HTGR (1200 K)", blurb: "High-temperature gas reactor" },
];

// ─── Number formatting ───────────────────────────────────────────────
function formatEnergy(E_eV: number): string {
  if (E_eV < 1e-3) return `${(E_eV * 1e3).toFixed(2)} meV`;
  if (E_eV < 1) return `${E_eV.toFixed(3)} eV`;
  if (E_eV < 1e3) return `${E_eV.toFixed(2)} eV`;
  if (E_eV < 1e6) return `${(E_eV / 1e3).toFixed(2)} keV`;
  return `${(E_eV / 1e6).toFixed(2)} MeV`;
}

// ─── Component ───────────────────────────────────────────────────────
export function MaxwellBoltzmannSlider() {
  const [T_K, setT_K] = useState<number>(T_DEFAULT_K);
  const sliderId = useId();

  const mbSamples = useMemo(
    () =>
      samplePeakNormalized(
        (E) => maxwellBoltzmannDensity(E, T_K),
        ENERGIES_EV,
      ),
    [T_K],
  );
  const mbPath = useMemo(() => buildPath(mbSamples), [mbSamples]);
  const mbPeakE = useMemo(() => maxwellBoltzmannPeakEnergy(T_K), [T_K]);
  const kT_eV = K_BOLTZMANN_EV_PER_K * T_K;

  return (
    <figure
      style={{
        margin: "var(--spacing-12) 0",
        padding: "var(--spacing-6) var(--spacing-6) var(--spacing-4)",
        border: "1px solid var(--color-rule)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "var(--spacing-3)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xs)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          Neutron energy spectrum
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
            fontVariantNumeric: "tabular-nums",
            color: "var(--color-text-muted)",
          }}
        >
          {T_K} K
        </span>
      </div>

      {/* Plot */}
      <svg
        viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
        role="img"
        aria-labelledby={`${sliderId}-title`}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <title id={`${sliderId}-title`}>
          {`Neutron energy spectrum: Maxwell–Boltzmann at ${T_K} K peaks near ${formatEnergy(mbPeakE)}; Watt fission spectrum peaks near ${formatEnergy(FAST_REFERENCE_EV)}.`}
        </title>

        {/* Decade gridlines */}
        {DECADE_TICKS.map((tick) => (
          <line
            key={`grid-${tick.E_eV}`}
            x1={xCoord(tick.E_eV).toFixed(2)}
            x2={xCoord(tick.E_eV).toFixed(2)}
            y1={MARGIN.top}
            y2={MARGIN.top + INNER_H}
            stroke="var(--color-rule)"
            strokeWidth={1}
            shapeRendering="crispEdges"
          />
        ))}

        {/* Axis baseline */}
        <line
          x1={MARGIN.left}
          y1={MARGIN.top + INNER_H}
          x2={MARGIN.left + INNER_W}
          y2={MARGIN.top + INNER_H}
          stroke="var(--color-rule-strong)"
          strokeWidth={1}
          shapeRendering="crispEdges"
        />

        {/* X-axis tick labels */}
        {DECADE_TICKS.map((tick) => (
          <text
            key={`tick-${tick.E_eV}`}
            x={xCoord(tick.E_eV).toFixed(2)}
            y={MARGIN.top + INNER_H + 16}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="10"
            fill="var(--color-text-faint)"
          >
            {tick.label}
          </text>
        ))}

        {/* X-axis title */}
        <text
          x={MARGIN.left + INNER_W / 2}
          y={MARGIN.top + INNER_H + 40}
          textAnchor="middle"
          fontFamily="var(--font-body)"
          fontSize="11"
          fill="var(--color-text-muted)"
        >
          Neutron energy (eV)
        </text>

        {/* Reference markers — thermal */}
        <line
          x1={xCoord(THERMAL_REFERENCE_EV).toFixed(2)}
          x2={xCoord(THERMAL_REFERENCE_EV).toFixed(2)}
          y1={MARGIN.top}
          y2={MARGIN.top + INNER_H}
          stroke="var(--color-rule-strong)"
          strokeDasharray="2 3"
          strokeWidth={1}
        />
        <text
          x={(xCoord(THERMAL_REFERENCE_EV) + 4).toFixed(2)}
          y={MARGIN.top + 12}
          fontFamily="var(--font-display)"
          fontSize="10"
          fill="var(--color-text-muted)"
          letterSpacing="0.04em"
        >
          THERMAL
        </text>

        {/* Reference markers — fast */}
        <line
          x1={xCoord(FAST_REFERENCE_EV).toFixed(2)}
          x2={xCoord(FAST_REFERENCE_EV).toFixed(2)}
          y1={MARGIN.top}
          y2={MARGIN.top + INNER_H}
          stroke="var(--color-rule-strong)"
          strokeDasharray="2 3"
          strokeWidth={1}
        />
        <text
          x={(xCoord(FAST_REFERENCE_EV) - 4).toFixed(2)}
          y={MARGIN.top + 12}
          textAnchor="end"
          fontFamily="var(--font-display)"
          fontSize="10"
          fill="var(--color-text-muted)"
          letterSpacing="0.04em"
        >
          FAST
        </text>

        {/* Watt curve (reference, muted) */}
        <path
          d={WATT_PATH}
          fill="none"
          stroke="var(--color-data-2)"
          strokeWidth={1.75}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Maxwell–Boltzmann curve (active, rust accent) */}
        <path
          d={mbPath}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      {/* Slider */}
      <div
        style={{
          marginTop: "var(--spacing-4)",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: "var(--spacing-3)",
          alignItems: "center",
        }}
      >
        <label
          htmlFor={sliderId}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xs)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          Moderator T
        </label>
        <input
          id={sliderId}
          type="range"
          min={T_MIN_K}
          max={T_MAX_K}
          step={10}
          value={T_K}
          onChange={(e) => setT_K(Number(e.target.value))}
          aria-valuetext={`${T_K} kelvin; Maxwell–Boltzmann peak at ${formatEnergy(mbPeakE)}`}
          // Browser extensions (password managers, autofill) routinely add
          // caret-color/style attributes to inputs; React 19 strict
          // hydration flags the resulting attribute diff. The mismatch is
          // benign — the page renders correctly either way.
          suppressHydrationWarning
          style={{
            width: "100%",
            accentColor: "var(--color-accent)",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
            fontVariantNumeric: "tabular-nums",
            color: "var(--color-text)",
            minWidth: "5.5ch",
            textAlign: "right",
          }}
        >
          {T_K} K
        </span>
      </div>

      {/* Preset chips */}
      <div
        style={{
          marginTop: "var(--spacing-3)",
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--spacing-2)",
        }}
      >
        {PRESETS.map((p) => {
          const active = p.T_K === T_K;
          return (
            <button
              key={p.T_K}
              type="button"
              onClick={() => setT_K(p.T_K)}
              title={p.blurb}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xs)",
                fontVariantNumeric: "tabular-nums",
                padding: "4px 10px",
                borderRadius: "var(--radius-pill)",
                border: `1px solid ${active ? "var(--color-accent)" : "var(--color-rule-strong)"}`,
                background: active ? "var(--color-accent-soft)" : "transparent",
                color: active ? "var(--color-accent-text)" : "var(--color-text-muted)",
                cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Textual summary — readable as the figure's caption, also the
          accessible fallback if the SVG fails to render. */}
      <figcaption
        style={{
          marginTop: "var(--spacing-4)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          color: "var(--color-text-faint)",
          lineHeight: 1.5,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        At {T_K} K, the Maxwell–Boltzmann distribution peaks near{" "}
        <strong style={{ color: "var(--color-text)", fontWeight: 500 }}>
          {formatEnergy(mbPeakE)}
        </strong>{" "}
        (mean ≈ {formatEnergy(kT_eV)}). The Watt fission spectrum peaks near{" "}
        <strong style={{ color: "var(--color-text)", fontWeight: 500 }}>
          {formatEnergy(FAST_REFERENCE_EV)}
        </strong>{" "}
        — roughly{" "}
        {(FAST_REFERENCE_EV / mbPeakE).toExponential(1).replace("e+", "·10")}×
        higher. No realistic moderator temperature closes the gap; that's
        why "thermal vs fast" is a design choice, not a thermostat setting.
      </figcaption>
    </figure>
  );
}
