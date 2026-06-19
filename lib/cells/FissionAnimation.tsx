"use client";

/**
 * <FissionAnimation />
 *
 * The opening visual of Module 3 article 1. A 3D schematic of a
 * single fission event — chemistry-class molecular model style, with
 * protons and neutrons visible as individual spheres in a cluster.
 *
 * UX:
 *   - Auto-plays once on mount (5 seconds of animation real-time,
 *     mapped onto the physical timescale of the fission process).
 *   - The user can scrub the timeline with a range slider, or click a
 *     stage chip to jump to a representative moment.
 *   - The displayed time value tracks the actual physical timescale
 *     of fission events: approach (variable), capture (t = 0),
 *     deformation (10⁻¹⁸ → 10⁻¹⁴ s), scission, settle (10⁻¹⁴ → 10⁻¹²
 *     s). The slider itself is mechanically 0 → 5000 ms (animation
 *     time); the readout is real physics time.
 *   - Replay rewinds, picks a different daughter pair from the
 *     fission-pair table, and resumes auto-play.
 *
 * Architecture:
 *   - currentTimeMs is the single source of truth (the animation
 *     cursor in ms). Caption, active stage chip, real-time readout,
 *     and 3D positions all derive from it.
 *   - The selected fission pair is derived from playKey via
 *     pairForCycle(); successive replays rotate through the table
 *     deterministically.
 *   - The 3D canvas in FissionScene.tsx is dynamic-imported with
 *     ssr: false so three.js stays off other routes.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { pairForCycle } from "./fission-pairs";

const TOTAL_DURATION_MS = 5000;

// Phase boundaries — mirrors the timing constants inside FissionScene
// so caption text and 3D state never drift apart.
const PHASE_BOUNDARIES_MS = [1200, 1500, 2000, 2300] as const;

const PHASE_CAPTIONS: ReadonlyArray<string> = [
  "A free neutron approaches a U-235 nucleus.",
  "Capture. The compound nucleus U-236* is excited and unstable.",
  "Within ~10⁻¹⁴ s, the nucleus deforms.",
  "Scission. The nucleus snaps into two fragments; 2–4 prompt neutrons fly free.",
  "Result: two fission products plus a small population of free neutrons. Each is a candidate to cause another fission.",
];

interface Stage {
  label: string;
  /** Representative moment within the stage, in animation ms. Slider jumps here. */
  midpointMs: number;
}

const STAGES: ReadonlyArray<Stage> = [
  { label: "Approach", midpointMs: 600 },
  { label: "Capture", midpointMs: 1350 },
  { label: "Deform", midpointMs: 1750 },
  { label: "Scission", midpointMs: 2150 },
  { label: "Settle", midpointMs: 4500 },
];

function phaseFromTime(timeMs: number): number {
  for (let i = 0; i < PHASE_BOUNDARIES_MS.length; i++) {
    if (timeMs < PHASE_BOUNDARIES_MS[i]!) return i;
  }
  return PHASE_BOUNDARIES_MS.length;
}

/**
 * Map animation cursor (ms) → physical time label. Fission timescales
 * span many orders of magnitude; we lay them onto the linear slider
 * via a piecewise mapping:
 *
 *   Approach (0–1200 ms)  → "approach" (neutron flight time is variable)
 *   Capture  (1200–1500)  → "t ≈ 0"
 *   Deform   (1500–2000)  → 10⁻¹⁸ s → 10⁻¹⁴ s on a log axis
 *   Scission (2000–2300)  → "scission (~10 fs)"
 *   Settle   (2300–5000)  → 10⁻¹⁴ s → 10⁻¹² s on a log axis
 */
function physicalTimeLabel(animTimeMs: number): string {
  if (animTimeMs < PHASE_BOUNDARIES_MS[0]) return "neutron in flight";
  if (animTimeMs < PHASE_BOUNDARIES_MS[1]) return "t ≈ 0 (capture)";

  if (animTimeMs < PHASE_BOUNDARIES_MS[2]) {
    const u = (animTimeMs - PHASE_BOUNDARIES_MS[1]) /
      (PHASE_BOUNDARIES_MS[2] - PHASE_BOUNDARIES_MS[1]);
    const logS = -18 + u * 4; // log10(seconds), -18 → -14
    return formatPhysicalTime(Math.pow(10, logS));
  }

  if (animTimeMs < PHASE_BOUNDARIES_MS[3]) return "scission (~10 fs)";

  const u = (animTimeMs - PHASE_BOUNDARIES_MS[3]) /
    (TOTAL_DURATION_MS - PHASE_BOUNDARIES_MS[3]);
  const logS = -14 + u * 2; // log10(seconds), -14 → -12
  return formatPhysicalTime(Math.pow(10, logS));
}

function formatPhysicalTime(seconds: number): string {
  if (seconds < 1e-15) {
    const as = seconds * 1e18;
    if (as < 10) return `${as.toFixed(2)} as`;
    return `${as.toFixed(1)} as`;
  }
  if (seconds < 1e-12) {
    const fs = seconds * 1e15;
    if (fs < 10) return `${fs.toFixed(2)} fs`;
    return `${fs.toFixed(1)} fs`;
  }
  if (seconds < 1e-9) {
    const ps = seconds * 1e12;
    if (ps < 10) return `${ps.toFixed(2)} ps`;
    return `${ps.toFixed(1)} ps`;
  }
  return `${(seconds * 1e9).toFixed(2)} ns`;
}

// three.js is heavy (~150 KB) and pulls in WebGL bindings; keep it off
// the SSR path and out of bundles for pages that don't render this cell.
const FissionScene = dynamic(() => import("./FissionScene"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-xs)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--color-text-faint)",
      }}
    >
      Loading scene…
    </div>
  ),
});

export function FissionAnimation() {
  const [playKey, setPlayKey] = useState(0);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const phase = phaseFromTime(currentTimeMs);
  const cameraUnlocked = hasInteracted || currentTimeMs >= TOTAL_DURATION_MS;
  const pair = useMemo(() => pairForCycle(playKey), [playKey]);

  // Auto-play loop: drive currentTimeMs forward via rAF. Stops when the
  // user scrubs or when the cursor reaches the total duration.
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isAutoPlay) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }
    let startWall = 0;
    let startCursor = 0;
    const tick = (now: number) => {
      if (startWall === 0) {
        startWall = now;
        startCursor = currentTimeMs;
      }
      const elapsed = now - startWall;
      const next = startCursor + elapsed;
      if (next >= TOTAL_DURATION_MS) {
        setCurrentTimeMs(TOTAL_DURATION_MS);
        setIsAutoPlay(false);
        return;
      }
      setCurrentTimeMs(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoPlay, playKey]);

  const handleReplay = useCallback(() => {
    setCurrentTimeMs(0);
    setIsAutoPlay(true);
    setHasInteracted(false);
    setPlayKey((k) => k + 1);
  }, []);

  const handleScrub = useCallback((nextMs: number) => {
    setIsAutoPlay(false);
    setHasInteracted(true);
    setCurrentTimeMs(nextMs);
  }, []);

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
          onClick={handleReplay}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xs)",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "0.04em",
            padding: "4px 10px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--color-rule-strong)",
            background: "transparent",
            color: "var(--color-text)",
            cursor: "pointer",
          }}
        >
          ↻ Replay
        </button>
      </div>

      {/* 3D canvas container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          background: "var(--color-bg)",
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
        }}
      >
        <FissionScene
          playKey={playKey}
          currentTimeMs={currentTimeMs}
          cameraUnlocked={cameraUnlocked}
          pair={pair}
        />
        {cameraUnlocked ? (
          <div
            style={{
              position: "absolute",
              bottom: "var(--spacing-2)",
              right: "var(--spacing-3)",
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xs)",
              letterSpacing: "0.06em",
              color: "var(--color-text-faint)",
              pointerEvents: "none",
            }}
          >
            drag to rotate
          </div>
        ) : null}
      </div>

      {/* Timeline scrubber — slider position is animation time;
          readout is real physical time of the fission process. */}
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
          htmlFor="fission-anim-scrub"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xs)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          Time
        </label>
        <input
          id="fission-anim-scrub"
          type="range"
          min={0}
          max={TOTAL_DURATION_MS}
          step={20}
          value={Math.round(currentTimeMs)}
          onChange={(e) => handleScrub(Number(e.target.value))}
          aria-valuetext={`Stage ${phase + 1}: ${STAGES[phase]?.label ?? "complete"}; ${physicalTimeLabel(currentTimeMs)}`}
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
            minWidth: "11ch",
            textAlign: "right",
          }}
        >
          {physicalTimeLabel(currentTimeMs)}
        </span>
      </div>

      {/* Stage chips */}
      <div
        style={{
          marginTop: "var(--spacing-3)",
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--spacing-2)",
        }}
      >
        {STAGES.map((stage, i) => {
          const active = phase === i;
          return (
            <button
              key={stage.label}
              type="button"
              onClick={() => handleScrub(stage.midpointMs)}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xs)",
                fontVariantNumeric: "tabular-nums",
                padding: "4px 10px",
                borderRadius: "var(--radius-pill)",
                border: `1px solid ${active ? "var(--color-accent)" : "var(--color-rule-strong)"}`,
                background: active
                  ? "var(--color-accent-soft)"
                  : "transparent",
                color: active
                  ? "var(--color-accent-text)"
                  : "var(--color-text-muted)",
                cursor: "pointer",
              }}
            >
              {i + 1}. {stage.label}
            </button>
          );
        })}
      </div>

      {/* Phase caption + current daughter pair line */}
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
        {phase >= 3 ? (
          <>
            {" "}
            <strong style={{ color: "var(--color-text)", fontWeight: 500 }}>
              U-235 + n → {pair.heavyName} + {pair.lightName} + {pair.freeN}n
            </strong>{" "}
            <span style={{ color: "var(--color-text-muted)" }}>
              ({pair.blurb})
            </span>
            .
          </>
        ) : null}
      </figcaption>
    </figure>
  );
}
