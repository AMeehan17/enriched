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
 * Pedagogy:
 *   - The nucleus is rendered as a chemistry-class molecular model:
 *     ~70 individual protons (dark) and neutrons (rust) intermixed
 *     throughout the cluster volume.
 *   - The daughter fragments vary per replay: <FissionScene> takes a
 *     `pair` prop drawn from fission-pairs.ts (e.g. Ba-141 + Kr-92,
 *     Cs-137 + Rb-95, …). The visual is mass-conserving at the
 *     stylized scale: 27p + 45n in = same out, split between the two
 *     fragments and 2–4 prompt neutrons.
 *   - Floating labels (drei <Text>) tag the parent and the fragments
 *     as the cycle progresses: U-235 → U-236* → heavy_name + light_name.
 */

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { type Group, type Mesh } from "three";
import type { FissionPair } from "./fission-pairs";

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
const COLOR_FLASH = "#D04A1F";
const COLOR_LABEL = "#1A1A1A";
const COLOR_LABEL_HOT = "#B13914"; // --color-accent-text (WCAG-safe rust)

// ─── Stylized parent nucleus counts. U-235 (92p, 143n) → ~70 visible
//     nucleons at scale ~0.30. Capture adds 1 neutron to make U-236*
//     visually (27p + 44n + 1n = 27p + 45n).
const U235_PROTONS = 27;
const U235_NEUTRONS = 43;

// ─── Helpers
function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Deterministic 32-bit hash → [0, 1). Used for label shuffle + jitter. */
function hash01(seed: number): number {
  let x = (seed + 1) | 0;
  x = ((x ^ (x >>> 16)) * 0x85ebca6b) | 0;
  x = ((x ^ (x >>> 13)) * 0xc2b2ae35) | 0;
  x = (x ^ (x >>> 16)) | 0;
  return (x >>> 0) / 4294967296;
}

/** Phase index from animation time in ms. Mirrors the parent. */
function phaseFromTimeMs(timeMs: number): number {
  if (timeMs < 1200) return 0;
  if (timeMs < 1500) return 1;
  if (timeMs < 2000) return 2;
  if (timeMs < 2300) return 3;
  return 4;
}

/**
 * Build a nucleon cluster as a deterministic compact ball of N
 * positions, with `protonCount` of them tagged proton (the rest
 * neutron). Positions sampled on a dense lattice, kept by distance
 * from origin (compact spherical shape), then jittered to break the
 * regular lattice look. Labels assigned via hashed shuffle so protons
 * and neutrons are interspersed throughout the volume.
 */
function generateNucleonAssignments(
  count: number,
  protonCount: number,
  radius: number,
  seedSalt: number,
): Array<{ pos: [number, number, number]; isProton: boolean }> {
  const candidates: Array<{
    pos: [number, number, number];
    distSq: number;
  }> = [];
  const side = 8;
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

  const jitterScale = step * 0.32;
  const jittered: Array<[number, number, number]> = positions.map((p, i) => [
    p[0] + (hash01(i * 3 + 1 + seedSalt) - 0.5) * jitterScale,
    p[1] + (hash01(i * 3 + 2 + seedSalt) - 0.5) * jitterScale,
    p[2] + (hash01(i * 3 + 3 + seedSalt) - 0.5) * jitterScale,
  ]);

  const indices = Array.from({ length: count }, (_, i) => i);
  indices.sort(
    (a, b) =>
      hash01(a * 7 + 11 + seedSalt) - hash01(b * 7 + 11 + seedSalt),
  );
  const protonSet = new Set(indices.slice(0, protonCount));

  return jittered.map((pos, i) => ({ pos, isProton: protonSet.has(i) }));
}

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

// ─── Free-neutron trajectory directions. We pre-define 4 directions
//     and use the first `pair.freeN` of them.
const FREE_NEUTRON_TARGETS: ReadonlyArray<[number, number, number]> = [
  [-0.7, 2.5, 1.1],
  [1.3, -1.9, 1.6],
  [2.4, 0.9, -1.9],
  [-1.6, -1.2, -2.0],
];

interface FissionGeometryProps {
  currentTimeMs: number;
  pair: FissionPair;
}

function FissionGeometry({ currentTimeMs, pair }: FissionGeometryProps) {
  const nucleusRef = useRef<Group>(null);
  const neutronInRef = useRef<Mesh>(null);
  const fragment1Ref = useRef<Group>(null);
  const fragment2Ref = useRef<Group>(null);
  const flashRef = useRef<Mesh>(null);

  // Refs for up to 4 free neutrons. Excess refs are unused for low-N
  // pairs and harmlessly stay invisible.
  const freeRefs = useRef<Array<React.RefObject<Mesh | null>>>([]);
  if (freeRefs.current.length === 0) {
    for (let i = 0; i < FREE_NEUTRON_TARGETS.length; i++) {
      freeRefs.current.push({ current: null });
    }
  }

  // Mirror cursor + pair into refs so useFrame always reads latest
  // without re-binding on every render.
  const cursorRef = useRef<number>(currentTimeMs);
  const freeCountRef = useRef<number>(pair.freeN);
  useEffect(() => {
    cursorRef.current = currentTimeMs;
  }, [currentTimeMs]);
  useEffect(() => {
    freeCountRef.current = pair.freeN;
  }, [pair.freeN]);

  useFrame(() => {
    const t = Math.min(T_TOTAL, cursorRef.current / 1000);

    // Incoming neutron
    if (neutronInRef.current) {
      if (t < T_APPROACH_END) {
        const tp = smoothstep(t / T_APPROACH_END);
        neutronInRef.current.position.x = lerp(-6, 0, tp);
        neutronInRef.current.visible = true;
      } else {
        neutronInRef.current.visible = false;
      }
    }

    // Nucleus cluster — pulse + deformation
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

    // Scission flash
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

    // Fragment 1 (heavy) — flies left
    if (fragment1Ref.current) {
      if (t < T_DEFORM_END) {
        fragment1Ref.current.visible = false;
      } else {
        fragment1Ref.current.visible = true;
        const tp = smoothstep((t - T_DEFORM_END) / (T_TOTAL - T_DEFORM_END));
        fragment1Ref.current.position.set(
          lerp(-1.0, -3.4, tp),
          lerp(0, 0.35, tp),
          lerp(0, 0.25, tp),
        );
      }
    }

    // Fragment 2 (light) — flies right
    if (fragment2Ref.current) {
      if (t < T_DEFORM_END) {
        fragment2Ref.current.visible = false;
      } else {
        fragment2Ref.current.visible = true;
        const tp = smoothstep((t - T_DEFORM_END) / (T_TOTAL - T_DEFORM_END));
        fragment2Ref.current.position.set(
          lerp(0.8, 3.0, tp),
          lerp(0, -0.25, tp),
          lerp(0, -0.15, tp),
        );
      }
    }

    // Free neutrons — show first `freeN` of them
    const freeCount = freeCountRef.current;
    for (let i = 0; i < FREE_NEUTRON_TARGETS.length; i++) {
      const refObj = freeRefs.current[i];
      const mesh = refObj?.current;
      if (!mesh) continue;
      const target = FREE_NEUTRON_TARGETS[i]!;
      if (t < T_DEFORM_END || i >= freeCount) {
        mesh.visible = false;
      } else {
        mesh.visible = true;
        const tp = smoothstep((t - T_DEFORM_END) / (T_TOTAL - T_DEFORM_END));
        mesh.position.set(
          lerp(0, target[0], tp),
          lerp(0, target[1], tp),
          lerp(0, target[2], tp),
        );
      }
    }
  });

  // Phase-derived label visibility. React re-renders when currentTimeMs
  // changes; the conditionals below show the correct labels for the
  // current phase. The pair counts/names also feed through.
  const phase = phaseFromTimeMs(currentTimeMs);
  const showU235Label = phase === 0;
  const showU236Label = phase === 1 || phase === 2;
  const showFragmentLabels = phase >= 3;

  // Compute the actual U-236* neutron count visually (parent_n + 1)
  const u236Neutrons = U235_NEUTRONS + 1;

  // Heavy fragment's parent cluster radius scales with its nucleon count.
  // The volumes scale roughly with N^(1/3); the constants below are tuned
  // so the densities match the parent's.
  const radiusFor = (nucleonCount: number) => 0.32 * Math.cbrt(nucleonCount);

  const heavyN = pair.heavyProtons + pair.heavyNeutrons;
  const lightN = pair.lightProtons + pair.lightNeutrons;

  return (
    <>
      {/* Main nucleus cluster (U-235 → U-236*) */}
      <group ref={nucleusRef} position={[0, 0, 0]}>
        <NucleonCluster
          protons={U235_PROTONS}
          neutrons={U235_NEUTRONS}
          radius={1.05}
          seedSalt={11}
        />
        {showU235Label ? (
          <Text
            position={[0, 1.7, 0]}
            fontSize={0.45}
            color={COLOR_LABEL}
            anchorX="center"
            anchorY="middle"
            outlineColor="#FAF9F6"
            outlineWidth={0.04}
            outlineBlur={0.02}
          >
            U-235
          </Text>
        ) : null}
        {showU236Label ? (
          <Text
            position={[0, 1.7, 0]}
            fontSize={0.45}
            color={COLOR_LABEL_HOT}
            anchorX="center"
            anchorY="middle"
            outlineColor="#FAF9F6"
            outlineWidth={0.04}
            outlineBlur={0.02}
          >
            U-236*
          </Text>
        ) : null}
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

      {/* Incoming neutron */}
      <mesh ref={neutronInRef} position={[-6, 0, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial
          color={COLOR_NEUTRON}
          roughness={0.55}
          metalness={0}
        />
      </mesh>

      {/* Heavy fragment cluster */}
      <group ref={fragment1Ref} position={[0, 0, 0]} visible={false}>
        <NucleonCluster
          protons={pair.heavyProtons}
          neutrons={pair.heavyNeutrons}
          radius={radiusFor(heavyN)}
          seedSalt={23}
        />
        {showFragmentLabels ? (
          <Text
            position={[0, radiusFor(heavyN) + 0.6, 0]}
            fontSize={0.4}
            color={COLOR_LABEL}
            anchorX="center"
            anchorY="middle"
            outlineColor="#FAF9F6"
            outlineWidth={0.04}
            outlineBlur={0.02}
          >
            {pair.heavyName}
          </Text>
        ) : null}
      </group>

      {/* Light fragment cluster */}
      <group ref={fragment2Ref} position={[0, 0, 0]} visible={false}>
        <NucleonCluster
          protons={pair.lightProtons}
          neutrons={pair.lightNeutrons}
          radius={radiusFor(lightN)}
          seedSalt={37}
        />
        {showFragmentLabels ? (
          <Text
            position={[0, radiusFor(lightN) + 0.6, 0]}
            fontSize={0.4}
            color={COLOR_LABEL}
            anchorX="center"
            anchorY="middle"
            outlineColor="#FAF9F6"
            outlineWidth={0.04}
            outlineBlur={0.02}
          >
            {pair.lightName}
          </Text>
        ) : null}
      </group>

      {/* Free prompt neutrons — up to 4 slots, first `pair.freeN` visible */}
      {FREE_NEUTRON_TARGETS.map((_, i) => (
        <mesh
          key={i}
          ref={freeRefs.current[i]!}
          position={[0, 0, 0]}
          visible={false}
        >
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
  /** Fission daughter pair for this cycle; rotates per playKey. */
  pair: FissionPair;
}

export default function FissionScene({
  playKey,
  currentTimeMs,
  cameraUnlocked,
  pair,
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
      <FissionGeometry currentTimeMs={currentTimeMs} pair={pair} />
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
