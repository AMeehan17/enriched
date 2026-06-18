"use client";

/**
 * <FissionAnimation />
 *
 * The opening visual of Module 3 article 1. A schematic, geometric
 * animation of a single fission event: an incoming neutron captures
 * into a U-235 nucleus, the resulting compound nucleus deforms,
 * then snaps into two fragments and a small population of free
 * neutrons. Plays once on mount; a replay button runs it again.
 *
 * This is a schematic. Real fission happens in ~10⁻¹⁴ s and nuclei
 * are not hard spheres with crisp edges. The cell trades accuracy
 * for legibility — the reader's first encounter with fission should
 * be visual before it's analytical.
 *
 * Animation is driven by CSS keyframes (set up in the inline style
 * block below). React owns the phase index for caption text and the
 * `key` prop on the wrapper that resets the animation on replay.
 */

import { useEffect, useId, useState } from "react";

// Total animation duration, ms. Phase durations sum to this — the
// CSS @keyframes percentages below mirror these timings.
const TOTAL_DURATION_MS = 5000;
const PHASE_DURATIONS_MS = [1200, 300, 500, 300, 2700];

const PHASE_CAPTIONS: ReadonlyArray<string> = [
  "A free neutron approaches a U-235 nucleus.",
  "Capture. The compound nucleus U-236* is excited and unstable.",
  "Within ~10⁻¹⁴ s, the nucleus deforms.",
  "Scission. The nucleus snaps into two fragments; 2–3 prompt neutrons fly free.",
  "Result: two fission products plus a small population of free neutrons. Each is a candidate to cause another fission.",
];

export function FissionAnimation() {
  const [playKey, setPlayKey] = useState(0);
  const [phase, setPhase] = useState<number>(0);
  const [done, setDone] = useState(false);
  const id = useId();

  // Drive the caption advance through phases. The CSS animation runs
  // independently; this effect just steps `phase` so the caption text
  // tracks what the user sees.
  useEffect(() => {
    setPhase(0);
    setDone(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    for (let i = 1; i < PHASE_DURATIONS_MS.length; i++) {
      elapsed += PHASE_DURATIONS_MS[i - 1]!;
      const idx = i;
      timers.push(
        setTimeout(() => setPhase(idx), elapsed),
      );
    }
    timers.push(setTimeout(() => setDone(true), TOTAL_DURATION_MS));
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [playKey]);

  return (
    <figure
      style={{
        margin: "var(--spacing-8) 0 var(--spacing-12)",
        padding: "var(--spacing-6) var(--spacing-6) var(--spacing-4)",
        border: "1px solid var(--color-rule)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface)",
      }}
    >
      {/* Scoped keyframes. React 19 hoists <style> to <head> and de-dupes
          across instances, so the rules live with the component but only
          ship once per page. */}
      <style>{`
        @keyframes fa-${id}-neutron-in {
          0% { transform: translate(-200px, 0); opacity: 1; }
          24% { transform: translate(0, 0); opacity: 1; }
          26% { transform: translate(0, 0); opacity: 0; }
          100% { transform: translate(0, 0); opacity: 0; }
        }
        @keyframes fa-${id}-nucleus {
          0% { transform: scale(1, 1); opacity: 1; }
          24% { transform: scale(1, 1); opacity: 1; }
          27% { transform: scale(1.18, 1.18); opacity: 1; }
          30% { transform: scale(1.08, 1.08); opacity: 1; }
          40% { transform: scale(1.55, 0.78); opacity: 1; }
          43% { transform: scale(1.65, 0.72); opacity: 1; }
          46% { transform: scale(1, 1); opacity: 0; }
          100% { transform: scale(1, 1); opacity: 0; }
        }
        @keyframes fa-${id}-label-u235 {
          0% { opacity: 1; }
          24% { opacity: 1; }
          26% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes fa-${id}-label-u236 {
          0% { opacity: 0; }
          26% { opacity: 0; }
          28% { opacity: 1; }
          40% { opacity: 1; }
          44% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes fa-${id}-fragment-1 {
          0%, 46% { transform: translate(0, 0); opacity: 0; }
          47% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(-160px, -12px); opacity: 1; }
        }
        @keyframes fa-${id}-fragment-2 {
          0%, 46% { transform: translate(0, 0); opacity: 0; }
          47% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(140px, 14px); opacity: 1; }
        }
        @keyframes fa-${id}-nout-1 {
          0%, 46% { transform: translate(0, 0); opacity: 0; }
          47% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(-60px, -90px); opacity: 1; }
        }
        @keyframes fa-${id}-nout-2 {
          0%, 46% { transform: translate(0, 0); opacity: 0; }
          47% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(80px, 100px); opacity: 1; }
        }
        @keyframes fa-${id}-nout-3 {
          0%, 46% { transform: translate(0, 0); opacity: 0; }
          47% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(170px, -80px); opacity: 1; }
        }
        @keyframes fa-${id}-flash {
          0%, 44% { opacity: 0; r: 0; }
          46% { opacity: 0.55; r: 70; }
          54% { opacity: 0; r: 110; }
          100% { opacity: 0; r: 110; }
        }
        @keyframes fa-${id}-energy {
          0%, 46% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0.85; }
        }
        .fa-${id}-anim {
          transform-box: fill-box;
          transform-origin: center;
        }
      `}</style>

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
          Fission schematic
        </span>
        <button
          type="button"
          onClick={() => setPlayKey((k) => k + 1)}
          disabled={!done}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xs)",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "0.04em",
            padding: "4px 10px",
            borderRadius: "var(--radius-pill)",
            border: `1px solid ${done ? "var(--color-rule-strong)" : "var(--color-rule)"}`,
            background: "transparent",
            color: done ? "var(--color-text)" : "var(--color-text-faint)",
            cursor: done ? "pointer" : "default",
            opacity: done ? 1 : 0.5,
            transition: "opacity 0.2s ease",
          }}
        >
          ↻ Replay
        </button>
      </div>

      {/* SVG stage. `key={playKey}` remounts the SVG on replay, restarting
          the CSS animations from frame 0. */}
      <svg
        key={playKey}
        viewBox="0 0 800 300"
        role="img"
        aria-labelledby={`${id}-title`}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          background: "var(--color-bg)",
          borderRadius: "var(--radius-sm)",
        }}
      >
        <title id={`${id}-title`}>
          Schematic of a uranium-235 fission event: a neutron is captured,
          the nucleus deforms, then splits into two fragments plus
          additional free neutrons.
        </title>

        {/* Flash at scission point — rust energy release */}
        <circle
          cx={400}
          cy={150}
          r={0}
          fill="var(--color-accent)"
          style={{
            animation: `fa-${id}-flash ${TOTAL_DURATION_MS}ms linear forwards`,
          }}
        />

        {/* Main nucleus (U-235 / U-236*) — centered at (400, 150).
            The class sets transform-box: fill-box + transform-origin: center,
            so scale transforms pivot around the nucleus's own center. */}
        <g
          className={`fa-${id}-anim`}
          style={{
            animation: `fa-${id}-nucleus ${TOTAL_DURATION_MS}ms linear forwards`,
          }}
        >
          <circle cx={400} cy={150} r={42} fill="var(--color-data-2)" />
          <circle
            cx={400}
            cy={150}
            r={42}
            fill="none"
            stroke="var(--color-text)"
            strokeOpacity={0.35}
            strokeWidth={1}
          />
        </g>

        {/* U-235 label — visible until capture */}
        <text
          x={400}
          y={155}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="14"
          fontWeight={500}
          fill="var(--color-text)"
          style={{
            animation: `fa-${id}-label-u235 ${TOTAL_DURATION_MS}ms linear forwards`,
          }}
        >
          U-235
        </text>

        {/* U-236* label — visible during capture and deformation */}
        <text
          x={400}
          y={155}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="14"
          fontWeight={500}
          fill="var(--color-accent-text)"
          style={{
            animation: `fa-${id}-label-u236 ${TOTAL_DURATION_MS}ms linear forwards`,
          }}
        >
          U-236*
        </text>

        {/* Incoming neutron — flies in from the left to (400, 150) */}
        <g
          style={{
            animation: `fa-${id}-neutron-in ${TOTAL_DURATION_MS}ms linear forwards`,
            transformBox: "fill-box",
          }}
        >
          <circle cx={400} cy={150} r={8} fill="var(--color-accent)" />
          <text
            x={400}
            y={154}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="10"
            fill="var(--color-bg)"
            fontWeight={600}
          >
            n
          </text>
        </g>

        {/* Fragment 1 — Ba-141 (larger, flies left) */}
        <g
          style={{
            animation: `fa-${id}-fragment-1 ${TOTAL_DURATION_MS}ms cubic-bezier(0.2, 0.6, 0.4, 1) forwards`,
            transformBox: "fill-box",
          }}
        >
          <circle cx={400} cy={150} r={30} fill="var(--color-data-2)" />
          <circle
            cx={400}
            cy={150}
            r={30}
            fill="none"
            stroke="var(--color-text)"
            strokeOpacity={0.35}
            strokeWidth={1}
          />
          <text
            x={400}
            y={155}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="11"
            fill="var(--color-text)"
            fontWeight={500}
          >
            Ba-141
          </text>
        </g>

        {/* Fragment 2 — Kr-92 (smaller, flies right) */}
        <g
          style={{
            animation: `fa-${id}-fragment-2 ${TOTAL_DURATION_MS}ms cubic-bezier(0.2, 0.6, 0.4, 1) forwards`,
            transformBox: "fill-box",
          }}
        >
          <circle cx={400} cy={150} r={24} fill="var(--color-data-2)" />
          <circle
            cx={400}
            cy={150}
            r={24}
            fill="none"
            stroke="var(--color-text)"
            strokeOpacity={0.35}
            strokeWidth={1}
          />
          <text
            x={400}
            y={154}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="10"
            fill="var(--color-text)"
            fontWeight={500}
          >
            Kr-92
          </text>
        </g>

        {/* Three prompt neutrons radiate from scission point */}
        <g
          style={{
            animation: `fa-${id}-nout-1 ${TOTAL_DURATION_MS}ms cubic-bezier(0.2, 0.6, 0.4, 1) forwards`,
            transformBox: "fill-box",
          }}
        >
          <circle cx={400} cy={150} r={6} fill="var(--color-accent)" />
        </g>
        <g
          style={{
            animation: `fa-${id}-nout-2 ${TOTAL_DURATION_MS}ms cubic-bezier(0.2, 0.6, 0.4, 1) forwards`,
            transformBox: "fill-box",
          }}
        >
          <circle cx={400} cy={150} r={6} fill="var(--color-accent)" />
        </g>
        <g
          style={{
            animation: `fa-${id}-nout-3 ${TOTAL_DURATION_MS}ms cubic-bezier(0.2, 0.6, 0.4, 1) forwards`,
            transformBox: "fill-box",
          }}
        >
          <circle cx={400} cy={150} r={6} fill="var(--color-accent)" />
        </g>

        {/* Energy callout — appears at scission */}
        <text
          x={400}
          y={50}
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize="14"
          fontWeight={500}
          letterSpacing="0.04em"
          fill="var(--color-accent-text)"
          style={{
            animation: `fa-${id}-energy ${TOTAL_DURATION_MS}ms linear forwards`,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          ≈ 200 MeV
        </text>
      </svg>

      {/* Phase caption */}
      <figcaption
        style={{
          marginTop: "var(--spacing-4)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          color: "var(--color-text-faint)",
          lineHeight: 1.5,
          fontVariantNumeric: "tabular-nums",
          minHeight: "3em",
        }}
        aria-live="polite"
      >
        {PHASE_CAPTIONS[phase]}
      </figcaption>
    </figure>
  );
}
