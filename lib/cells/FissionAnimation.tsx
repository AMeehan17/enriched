"use client";

/**
 * <FissionAnimation />
 *
 * The opening visual of Module 3 article 1. A 3D schematic of a
 * single fission event — chemistry-class molecular model style, with
 * protons and neutrons visible as individual spheres in a cluster.
 *
 * UX:
 *   - Auto-plays once on mount (5 seconds total).
 *   - The user can scrub the timeline with a range slider, or click a
 *     stage chip to jump to a representative moment.
 *   - Replay rewinds to t = 0 and resumes auto-play.
 *   - After auto-play completes (or as soon as the user interacts),
 *     the camera unlocks for drag-to-rotate.
 *
 * Architecture:
 *   - This component owns `currentTimeMs` as the single source of
 *     truth. Caption text, active stage chip, and the 3D positions
 *     all derive from it.
 *   - The 3D canvas in FissionScene.tsx receives `currentTimeMs` as
 *     a prop and animates positions from it. The canvas is
 *     dynamic-imported with ssr: false so three.js stays off other
 *     routes.
 *   - Auto-play is a requestAnimationFrame loop that advances
 *     `currentTimeMs`; user interaction (slider or chip) cancels
 *     auto-play and lets the user own the cursor.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const TOTAL_DURATION_MS = 5000;

// Phase boundaries — mirrors the timing constants inside FissionScene
// so caption text and 3D state never drift apart.
const PHASE_BOUNDARIES_MS = [1200, 1500, 2000, 2300] as const;

const PHASE_CAPTIONS: ReadonlyArray<string> = [
  "A free neutron approaches a U-235 nucleus.",
  "Capture. The compound nucleus U-236* is excited and unstable.",
  "Within ~10⁻¹⁴ s, the nucleus deforms.",
  "Scission. The nucleus snaps into two fragments; 2–3 prompt neutrons fly free.",
  "Result: two fission products plus a small population of free neutrons. Each is a candidate to cause another fission.",
];

interface Stage {
  label: string;
  /** Representative moment within the stage, in ms. Slider jumps here. */
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

function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(2) + " s";
}

export function FissionAnimation() {
  const [playKey, setPlayKey] = useState(0);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const phase = phaseFromTime(currentTimeMs);
  const cameraUnlocked = hasInteracted || currentTimeMs >= TOTAL_DURATION_MS;

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
    // We intentionally do not depend on currentTimeMs — the loop captures
    // its current value on first tick and advances from there.
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
            transition: "opacity 0.2s ease",
          }}
        >
          ↻ Replay
        </button>
      </div>

      {/* 3D canvas container — fixed 16:9, light bg matches DESIGN.md surface */}
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

      {/* Timeline scrubber */}
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
          aria-valuetext={`${formatSeconds(currentTimeMs)} of ${formatSeconds(TOTAL_DURATION_MS)}; stage ${phase + 1}: ${STAGES[phase]?.label ?? "complete"}`}
          // Browser extensions inject caret-color/style attributes on inputs;
          // React 19 strict hydration flags the resulting diff. Benign.
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
          {formatSeconds(currentTimeMs)}
        </span>
      </div>

      {/* Stage chips — click to jump to that stage */}
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
