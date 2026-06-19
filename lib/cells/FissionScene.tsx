"use client";

/**
 * FissionScene — the 3D canvas content for <FissionAnimation>.
 *
 * Dynamic-imported by the parent so three.js + react-three-fiber + drei
 * ship only on /reference/fission. SSR is disabled at the import site.
 *
 * Animation cursor (currentTimeMs) is owned by the parent and passed
 * in as a prop. The scene reads it via a ref inside useFrame so the
 * 3D positions track the user's slider scrubs at full r3f frame rate
 * without going through React reconciliation on every frame.
 *
 * The nucleus and the fragments render as chemistry-class molecular
 * models: tight clusters of small spheres representing individual
 * protons (dark) and neutrons (rust). The visible counts are stylized
 * (~32 nucleons for the parent rather than 235), but the
 * proton:neutron ratio mirrors the actual nuclide.
 *
 * Aesthetic budget (DESIGN.md): flat-ish standard materials, single
 * key light + ambient fill, dark gray for protons, rust for neutrons,
 * larger free-flying rust spheres for the prompt neutrons released
 * at scission. No textures, no environment maps.
 */

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { type Group, type Mesh } from "three";

// ─── Animation timing (seconds). MUST mirror PHASE_BOUNDARIES_MS in
//     FissionAnimation.tsx — both are derived from the same conceptual
//     phase schedule.
const T_APPROACH_END = 1.2;
const T_CAPTURE_END = 1.5;
const T_DEFORM_END = 2.0;
const T_TOTAL = 5.0;

// ─── DESIGN.md tokens hardcoded (three.js can't read CSS variables).
const COLOR_PROTON = "#1A1A1A"; // --color-text — strongest contrast vs bg
const COLOR_NEUTRON = "#D04A1F"; // --color-accent — rust
const COLOR_FLASH = "#D04A1F"; // --color-accent (with opacity)

// ─── Stylized nucleon counts. Real U-235 = 92p + 143n; we render a
//     visually legible ~70-nucleon cluster at ~0.30× scale, keeping
//     the actual proton:neutron ratios for each species. Mass balance
//     is exact: parent (27p + 44n, post-capture) = Ba-141 (16p + 25n)
//     + Kr-92 (11p + 16n) + 3 free neutrons. Both proton and neutron
//     totals conserve across the reaction.
//
// Real:    U-235 + n      → Ba-141    + Kr-92    + 3n
//          92p + 144n     → 56p + 85n + 36p + 56n + 0p + 3n   (✓ 92p; ✓ 144n)
// Stylized (scale ≈ 0.30):
//          27p + 44n      → 16p + 25n + 11p + 16n + 0p + 3n   (✓ 27p; ✓ 44n)
const U235_PROTONS = 27;
const U235_NEUTRONS = 43; // pre-capture; capture adds 1 neutron in the pulse
const BA141_PROTONS = 16;
const BA141_NEUTRONS = 25;
const KR92_PROTONS = 11;
const KR92_NEUTRONS = 16;

// ─── Helpers
function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Deterministic 32-bit hash → [0, 1). Used to shuffle nucleon labels
 * and to perturb positions, so the cluster looks irregular but the
 * exact same pattern shows up on every replay.
 */
function hash01(seed: number): number {
  let x = (seed + 1) | 0;
  x = ((x ^ (x >>> 16)) * 0x85ebca6b) | 0;
  x = ((x ^ (x >>> 13)) * 0xc2b2ae35) | 0;
  x = (x ^ (x >>> 16)) | 0;
  return (x >>> 0) / 4294967296;
}

/**
 * Build a nucleon cluster as a deterministic compact ball of N
 * positions, with `protonCount` of them tagged proton (the rest
 * neutron). Positions are sampled on a dense lattice, kept by
 * distance from origin (compact spherical shape), then jittered to
 * break the regular lattice look. Labels are assigned via a hashed
 * shuffle so protons and neutrons are interspersed throughout the
 * volume — not stratified by depth.
 */
function generateNucleonAssignments(
  count: number,
  protonCount: number,
  radius: number,
  seedSalt: number,
): Array<{ pos: [number, number, number]; isProton: boolean }> {
  // 1) Lattice candidates within a slightly oversized box, then take
  //    the closest N to the origin so the cluster reads as a ball.
  const candidates: Array<{
    pos: [number, number, number];
    distSq: number;
  }> = [];
  const side = 8; // 8x8x8 = 512 candidates, plenty for any count up to ~200
  const step = (2 * radius) / (side - 1);
  for (let xi = 0; xi < side; xi++) {
    for (let yi = 0; yi < side; yi++) {
      for (let zi = 0; zi < side; zi++) {
        const x = -radius + xi * step;
        const y = -radius + yi * step;
        const z = -radius + zi * step;
        candidates.push({ pos: [x, y, z], distSq: x * x + y * y + z * z });
      }
    }
  }
  candidates.sort((a, b) => a.distSq - b.distSq);
  const positions = candidates.slice(0, count).map((c) => c.pos);

  // 2) Per-nucleon jitter — small Gaussian-ish offset based on hash so
  //    the lattice grid disappears into a natural-looking pack.
  const jitterScale = step * 0.32;
  const jittered: Array<[number, number, number]> = positions.map((p, i) => [
    p[0] + (hash01(i * 3 + 1 + seedSalt) - 0.5) * jitterScale,
    p[1] + (hash01(i * 3 + 2 + seedSalt) - 0.5) * jitterScale,
    p[2] + (hash01(i * 3 + 3 + seedSalt) - 0.5) * jitterScale,
  ]);

  // 3) Label shuffle — assign exactly `protonCount` indices as protons,
  //    spread throughout the cluster (not clumped in the core).
  const indices = Array.from({ length: count }, (_, i) => i);
  indices.sort(
    (a, b) =>
      hash01(a * 7 + 11 + seedSalt) - hash01(b * 7 + 11 + seedSalt),
  );
  const protonSet = new Set(indices.slice(0, protonCount));

  return jittered.map((pos, i) => ({ pos, isProton: protonSet.has(i) }));
}

/**
 * Render a nucleon cluster: protons in dark, neutrons in rust,
 * intermixed throughout the volume. Deterministic per seedSalt so a
 * given cluster's pattern is stable across replays.
 */
function NucleonCluster({
  protons,
  neutrons,
  radius,
  nucleonRadius = 0.2,
  seedSalt = 0,
}: {
  protons: number;
  neutrons: number;
  radius: number;
  nucleonRadius?: number;
  seedSalt?: number;
}) {
  const nucleons = useMemo(
    () =>
      generateNucleonAssignments(
        protons + neutrons,
        protons,
        radius,
        seedSalt,
      ),
    [protons, neutrons, radius, seedSalt],
  );

  return (
    <>
      {nucleons.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[nucleonRadius, 18, 18]} />
          <meshStandardMaterial
            color={n.isProton ? COLOR_PROTON : COLOR_NEUTRON}
            roughness={0.5}
            metalness={0.05}
          />
        </mesh>
      ))}
    </>
  );
}

interface FissionGeometryProps {
  /** Live cursor into the animation timeline, ms. */
  currentTimeMs: number;
}

function FissionGeometry({ currentTimeMs }: FissionGeometryProps) {
  const nucleusRef = useRef<Group>(null);
  const neutronInRef = useRef<Mesh>(null);
  const fragment1Ref = useRef<Group>(null);
  const fragment2Ref = useRef<Group>(null);
  const nout1Ref = useRef<Mesh>(null);
  const nout2Ref = useRef<Mesh>(null);
  const nout3Ref = useRef<Mesh>(null);
  const flashRef = useRef<Mesh>(null);

  // Mirror the prop into a ref so useFrame always reads the latest cursor
  // without needing to be re-bound on every render.
  const cursorRef = useRef<number>(currentTimeMs);
  useEffect(() => {
    cursorRef.current = currentTimeMs;
  }, [currentTimeMs]);

  useFrame(() => {
    const t = Math.min(T_TOTAL, cursorRef.current / 1000);

    // ─── Incoming neutron: flies from (-6, 0, 0) to (0, 0, 0) during
    //     phase 0; disappears at capture.
    if (neutronInRef.current) {
      if (t < T_APPROACH_END) {
        const tp = smoothstep(t / T_APPROACH_END);
        neutronInRef.current.position.x = lerp(-6, 0, tp);
        neutronInRef.current.visible = true;
      } else {
        neutronInRef.current.visible = false;
      }
    }

    // ─── Nucleus cluster: scale animation through capture pulse +
    //     deformation. Hidden after scission.
    if (nucleusRef.current) {
      if (t < T_APPROACH_END) {
        nucleusRef.current.scale.set(1, 1, 1);
        nucleusRef.current.visible = true;
      } else if (t < T_CAPTURE_END) {
        const tp = (t - T_APPROACH_END) / (T_CAPTURE_END - T_APPROACH_END);
        const pulse = 1 + 0.16 * Math.sin(tp * Math.PI);
        nucleusRef.current.scale.set(pulse, pulse, pulse);
        nucleusRef.current.visible = true;
      } else if (t < T_DEFORM_END) {
        const tp = smoothstep(
          (t - T_CAPTURE_END) / (T_DEFORM_END - T_CAPTURE_END),
        );
        nucleusRef.current.scale.set(
          1 + 0.55 * tp,
          1 - 0.22 * tp,
          1 - 0.22 * tp,
        );
        nucleusRef.current.visible = true;
      } else {
        nucleusRef.current.visible = false;
      }
    }

    // ─── Scission flash: a quick rust-color expanding shell. Visible
    //     only inside the scission window; reactive to slider scrubs.
    if (flashRef.current) {
      const mat = flashRef.current.material as { opacity?: number };
      if (t > T_DEFORM_END && t < T_DEFORM_END + 0.6) {
        const tp = (t - T_DEFORM_END) / 0.6;
        flashRef.current.visible = true;
        const radius = lerp(1, 3.5, tp);
        flashRef.current.scale.set(radius, radius, radius);
        if (mat.opacity !== undefined) {
          mat.opacity = 0.55 * (1 - tp);
        }
      } else {
        flashRef.current.visible = false;
      }
    }

    // ─── Fragment 1 (Ba-141, larger) — flies left + slight up/forward.
    if (fragment1Ref.current) {
      if (t < T_DEFORM_END) {
        fragment1Ref.current.visible = false;
      } else {
        fragment1Ref.current.visible = true;
        const tp = smoothstep(
          (t - T_DEFORM_END) / (T_TOTAL - T_DEFORM_END),
        );
        fragment1Ref.current.position.set(
          lerp(-1.0, -3.4, tp),
          lerp(0, 0.35, tp),
          lerp(0, 0.25, tp),
        );
      }
    }

    // ─── Fragment 2 (Kr-92, smaller) — flies right + slight down/back.
    if (fragment2Ref.current) {
      if (t < T_DEFORM_END) {
        fragment2Ref.current.visible = false;
      } else {
        fragment2Ref.current.visible = true;
        const tp = smoothstep(
          (t - T_DEFORM_END) / (T_TOTAL - T_DEFORM_END),
        );
        fragment2Ref.current.position.set(
          lerp(0.8, 3.0, tp),
          lerp(0, -0.25, tp),
          lerp(0, -0.15, tp),
        );
      }
    }

    // ─── Three free neutrons radiate from the scission point in
    //     different 3D directions.
    const neutronTargets: Array<[number, number, number]> = [
      [-0.6, 2.4, 1.1],
      [1.2, -1.8, 1.6],
      [2.4, 0.8, -1.9],
    ];
    const neutronRefs = [nout1Ref, nout2Ref, nout3Ref];
    for (let i = 0; i < neutronRefs.length; i++) {
      const ref = neutronRefs[i]!;
      const target = neutronTargets[i]!;
      if (!ref.current) continue;
      if (t < T_DEFORM_END) {
        ref.current.visible = false;
      } else {
        ref.current.visible = true;
        const tp = smoothstep(
          (t - T_DEFORM_END) / (T_TOTAL - T_DEFORM_END),
        );
        ref.current.position.set(
          lerp(0, target[0], tp),
          lerp(0, target[1], tp),
          lerp(0, target[2], tp),
        );
      }
    }
  });

  return (
    <>
      {/* Main nucleus cluster (U-235 → U-236*) — 27p + 43n */}
      <group ref={nucleusRef} position={[0, 0, 0]}>
        <NucleonCluster
          protons={U235_PROTONS}
          neutrons={U235_NEUTRONS}
          radius={1.05}
          seedSalt={11}
        />
      </group>

      {/* Scission flash */}
      <mesh ref={flashRef} position={[0, 0, 0]} visible={false}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color={COLOR_FLASH}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Incoming neutron — single rust sphere */}
      <mesh ref={neutronInRef} position={[-6, 0, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial
          color={COLOR_NEUTRON}
          roughness={0.55}
          metalness={0}
        />
      </mesh>

      {/* Fragment 1 cluster — Ba-141 (16p + 25n) */}
      <group ref={fragment1Ref} position={[0, 0, 0]} visible={false}>
        <NucleonCluster
          protons={BA141_PROTONS}
          neutrons={BA141_NEUTRONS}
          radius={0.85}
          seedSalt={23}
        />
      </group>

      {/* Fragment 2 cluster — Kr-92 (11p + 16n) */}
      <group ref={fragment2Ref} position={[0, 0, 0]} visible={false}>
        <NucleonCluster
          protons={KR92_PROTONS}
          neutrons={KR92_NEUTRONS}
          radius={0.72}
          seedSalt={37}
        />
      </group>

      {/* Free prompt neutrons — three rust spheres */}
      {[nout1Ref, nout2Ref, nout3Ref].map((ref, i) => (
        <mesh key={i} ref={ref} position={[0, 0, 0]} visible={false}>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial
            color={COLOR_NEUTRON}
            roughness={0.55}
            metalness={0}
          />
        </mesh>
      ))}
    </>
  );
}

interface FissionSceneProps {
  /** Bumps when Replay is pressed; remounts the canvas. */
  playKey: number;
  /** Live cursor into the animation timeline, ms. */
  currentTimeMs: number;
  /** Whether the camera should accept drag-rotate + auto-rotate. */
  cameraUnlocked: boolean;
}

export default function FissionScene({
  playKey,
  currentTimeMs,
  cameraUnlocked,
}: FissionSceneProps) {
  return (
    <Canvas
      key={playKey}
      camera={{ position: [3.5, 1.6, 5.5], fov: 50 }}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
      }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[5, 6, 4]} intensity={1.0} />
      <directionalLight position={[-4, -2, -3]} intensity={0.35} />
      <FissionGeometry currentTimeMs={currentTimeMs} />
      <OrbitControls
        enabled={cameraUnlocked}
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        minPolarAngle={Math.PI * 0.12}
        maxPolarAngle={Math.PI * 0.85}
        autoRotate={cameraUnlocked}
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
}
