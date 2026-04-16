// @ts-nocheck
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { ShippingContainer, makeLine } from "./ShippingContainer";

// ─── Color palette ──────────────────────────────────────────────────────────
// Both themes render on a dark harbor-background, so all palette values are
// tuned for visibility against navy / near-black canvas backgrounds.
const PALETTE = {
  dark: {
    primary: "#F9BE24", // DevGuard primary amber
    structure: "#4D7AB3", // structural wireframes
    dim: "#1F4D80", // yard containers
    dim2: "#2A5A8C", // ship containers
    water: "#0A1E3A", // water surface tint
    shipHull: "#142C4A", // ship hull fill
  },
  light: {
    primary: "#000000",
    structure: "#6B9CD4", // brighter wireframes on the lighter navy bg
    dim: "#3A6DA0",
    dim2: "#1E4670",
    water: "#0E2648",
    shipHull: "#183458",
  },
};

// ─── Layout constants ───────────────────────────────────────────────────────
const CRANE_Y = 5.5;
const CRANE_X0 = -10;
const CRANE_X1 = 13;
const CRANE_Z_NEG = -4;
const CRANE_Z_POS = 4;

const YS_X = -4; // crane start X (yard)
const YS_Y = 0; // crane start Y
const YS_Z = 0; // crane start Z
const YE_X = 6; // crane end X (ship deck, between bridge and cargo stacks)
const YE_Y = 1.18; // crane end Y (container center on deck: Y1=0.58 + h/2=0.6)
const YE_Z = -0.55; // crane end Z (align with front cargo row)
const LIFT_H = 4.5; // crane lift height

const SHIP_DEPART_X = 22; // departure offset (moves ship off-screen right)

// ─── Animation timeline (master progress 0 → 1) ────────────────────────────
const T = {
  // Phase 1 — crane loads container onto ship
  IDLE_END: 0.05,
  LIFT_END: 0.15,
  TRAVERSE_END: 0.32,
  LOWER_END: 0.42,
  PLACE_END: 0.48,
  // Phase 2 — crane returns empty to yard
  RETRACT_END: 0.52,
  RETURN_END: 0.6,
  DESCEND_END: 0.64,
  // Phase 3 — ship departs, pauses off-screen, returns
  DEPART_START: 0.58, // slight overlap with crane return for smooth feel
  DEPART_END: 0.75,
  AWAY_END: 0.8,
  ARRIVE_END: 0.95,
};

const ANIM_SPEED = 0.038; // ≈ 26-second full cycle

// ─── Easing helpers ─────────────────────────────────────────────────────────
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
function easeIn(t: number): number {
  return t * t;
}
function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}
function norm(p: number, start: number, end: number): number {
  return Math.max(0, Math.min(1, (p - start) / (end - start)));
}
function randomOpacity(seed: number): number {
  return Math.min(1, Math.sin(seed) + 1.5);
}

// ─── Static position data ───────────────────────────────────────────────────
const YARD_POSITIONS: [number, number, number][] = [
  [-10, 0, -4],
  [-10, 1.2, -4],
  [-10, 0, -1.5],
  [-10, 1.2, -1.5],
  [-10, 0, 1.5],
  [-10, 1.2, 1.5],
  [-7, 0, -4],
  [-7, 1.2, -4],
  [-7, 2.4, -4],
  [-7, 0, -1.5],
  [-7, 1.2, -1.5],
  [-7, 0, 1.5],
  [-7, 1.2, 1.5],
  [-7, 0, 4],
  [-7, 1.2, 4],
  [-4, 0, -4],
  [-4, 1.2, -4],
  [-4, 0, -1.5],
  [-4, 1.2, -1.5],
  [-4, 2.4, -1.5],
  [-4, 0, 1.5],
  [-4, 1.2, 1.5],
  [-4, 0, 4],
  [-4, 1.2, 4],
  [-1, 0, -4],
  [-1, 1.2, -4],
  [-1, 0, -1.5],
  [-1, 1.2, -1.5],
  [-1, 0, 1.5],
  [-1, 1.2, 1.5],
  [-1, 0, 4],
  [-1, 1.2, 4],
];

// Container dims: w=2.6 (x), h=1.2 (y), d=1.0 (z)
// Ship deck at Y1=0.58 → container-center Y = 0.58 + 0.6 = 1.18
// X spacing 2.8 (width 2.6 + 0.2 gap)
// Z spacing 1.1 (depth 1.0 + 0.1 gap)
const SHIP_CONTAINERS: [number, number, number][] = [
  // Bottom layer (columns shifted right so crane-drop at x=6 doesn't overlap)
  [8.6, 1.18, -0.55],
  [8.6, 1.18, 0.55],
  [11.2, 1.18, -0.55],
  [11.2, 1.18, 0.55],
  [13.5, 1.18, -0.55],
  [13.5, 1.18, 0.55],
  // Second layer
  [8.6, 2.38, -0.55],
  [11.2, 2.38, -0.55],
  [11.2, 2.38, 0.55],
  [13.5, 2.38, -0.55],
  // Third layer
  [11.2, 3.58, -0.55],
];

// ─── Scene sub-components ───────────────────────────────────────────────────

function YardGrid({ color }: { color: string }) {
  const lines = useMemo(() => {
    const result: THREE.Line[] = [];
    for (let x = -12; x <= 17; x += 2) {
      result.push(
        makeLine(
          [new THREE.Vector3(x, 0, -7), new THREE.Vector3(x, 0, 7)],
          color,
          0.08,
        ),
      );
    }
    for (let z = -7; z <= 7; z += 2) {
      result.push(
        makeLine(
          [new THREE.Vector3(-12, 0, z), new THREE.Vector3(17, 0, z)],
          color,
          0.08,
        ),
      );
    }
    return result;
  }, [color]);

  return (
    <group position={[0, -0.6, 0]}>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </group>
  );
}

/** Semi-transparent water surface with sparse horizontal lines.
 *  Starts at the coast line (x=1.0) and extends past the ship departure range. */
function Water({ color }: { color: string }) {
  // Coast is the thick line at x=1.0 — water starts just past it
  const waterLeft = 1.05;
  const waterRight = 44;
  const waterCenterX = (waterLeft + waterRight) / 2;
  const waterWidth = waterRight - waterLeft;

  const lines = useMemo(() => {
    const result: THREE.Line[] = [];
    for (let z = -6; z <= 6; z += 2.5) {
      result.push(
        makeLine(
          [
            new THREE.Vector3(waterLeft, 0.01, z),
            new THREE.Vector3(waterRight, 0.01, z),
          ],
          color,
          0.2,
        ),
      );
    }
    return result;
  }, [color]);

  return (
    <group position={[0, -0.6, 0]}>
      <mesh position={[waterCenterX, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[waterWidth, 14]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </group>
  );
}

function HarborCoast({ color }: { color: string }) {
  const lines = useMemo(() => {
    const res: THREE.Line[] = [];
    const v = (x: number, z: number) => new THREE.Vector3(x, 0, z);
    res.push(makeLine([v(1.0, -7), v(1.0, 7)], color, 0.45));
    for (let z = -6; z <= 6; z += 2) {
      res.push(makeLine([v(0.25, z), v(1.0, z)], color, 0.25));
    }
    return res;
  }, [color]);

  return (
    <group position={[0, -0.6, 0]}>
      <mesh position={[0.72, 0.02, 0]}>
        <boxGeometry args={[0.55, 0.03, 14]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} />
      </mesh>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </group>
  );
}

/** Ship wireframe hull — no animation refs, rendered inside the ship group. */
function ShipHull({ color }: { color: string }) {
  const lines = useMemo(() => {
    const res: THREE.Line[] = [];
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const ln = (a: THREE.Vector3, b: THREE.Vector3, op = 0.45) =>
      makeLine([a, b], color, op);

    const X0 = 2.2,
      X1 = 13.6,
      Y0 = -0.62,
      Y1 = 0.58;
    const Z0 = -2.25,
      Z1 = 2.25,
      BOW_X = 15.2,
      BRIDGE_X = 5.0;

    // Hull edges
    res.push(ln(v(X0, Y0, Z0), v(X1, Y0, Z0), 0.55));
    res.push(ln(v(X0, Y1, Z0), v(X1, Y1, Z0), 0.55));
    res.push(ln(v(X0, Y0, Z1), v(X1, Y0, Z1), 0.55));
    res.push(ln(v(X0, Y1, Z1), v(X1, Y1, Z1), 0.55));
    res.push(ln(v(X0, Y0, Z0), v(X0, Y1, Z0), 0.42));
    res.push(ln(v(X0, Y0, Z1), v(X0, Y1, Z1), 0.42));
    res.push(ln(v(X0, Y0, Z0), v(X0, Y0, Z1), 0.48));
    res.push(ln(v(X0, Y1, Z0), v(X0, Y1, Z1), 0.48));
    res.push(ln(v(X0, (Y0 + Y1) / 2, Z0), v(X0, (Y0 + Y1) / 2, Z1), 0.22));

    // Bow
    res.push(ln(v(X1, Y0, Z0), v(BOW_X, Y0, 0), 0.5));
    res.push(ln(v(X1, Y0, Z1), v(BOW_X, Y0, 0), 0.5));
    res.push(ln(v(X1, Y1, Z0), v(BOW_X, Y1, 0), 0.5));
    res.push(ln(v(X1, Y1, Z1), v(BOW_X, Y1, 0), 0.5));
    res.push(ln(v(BOW_X, Y0, 0), v(BOW_X, Y1, 0), 0.42));

    // Vertical ribs
    for (let x = X0 + 1; x < X1; x += 1.2) {
      res.push(ln(v(x, Y0, Z0), v(x, Y1, Z0), 0.2));
      res.push(ln(v(x, Y0, Z1), v(x, Y1, Z1), 0.2));
    }

    // Waterline
    res.push(ln(v(X0, 0, Z0), v(BOW_X, 0, Z0), 0.25));
    res.push(ln(v(X0, 0, Z1), v(BOW_X, 0, Z1), 0.25));
    res.push(ln(v(X0, Y0, 0), v(BOW_X, Y0, 0), 0.2));

    // Bridge superstructure
    const BH = 2.1,
      BZ = 1.05;
    const bx0 = X0 + 0.45,
      bx1 = BRIDGE_X - 0.45;
    const b = [
      v(bx0, Y1, -BZ),
      v(bx1, Y1, -BZ),
      v(bx1, Y1 + BH, -BZ),
      v(bx0, Y1 + BH, -BZ),
      v(bx0, Y1, BZ),
      v(bx1, Y1, BZ),
      v(bx1, Y1 + BH, BZ),
      v(bx0, Y1 + BH, BZ),
    ];
    const edges: [number, number][] = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ];
    for (const [a, b2] of edges) res.push(ln(b[a], b[b2], 0.52));

    // Mast + antennae
    const sxCenter = (bx0 + bx1) / 2;
    const sy1 = Y1 + BH + 1.2;
    res.push(ln(v(sxCenter, sy1, 0), v(sxCenter, sy1 + 1.1, 0), 0.36));
    res.push(
      ln(
        v(sxCenter - 0.45, sy1 + 0.75, 0),
        v(sxCenter + 0.45, sy1 + 0.75, 0),
        0.2,
      ),
    );
    res.push(
      ln(
        v(sxCenter - 0.35, sy1 + 0.95, -0.3),
        v(sxCenter + 0.35, sy1 + 0.95, 0.3),
        0.14,
      ),
    );
    res.push(
      ln(
        v(sxCenter - 0.35, sy1 + 0.95, 0.3),
        v(sxCenter + 0.35, sy1 + 0.95, -0.3),
        0.14,
      ),
    );

    // Bridge windows
    for (let y = Y1 + 0.45; y <= Y1 + 1.6; y += 0.38) {
      res.push(ln(v(bx1, y, -BZ), v(bx1, y, BZ), 0.18));
    }

    // Deck detail
    const deck0 = BRIDGE_X + 0.4,
      deck1 = X1 - 0.3;
    for (const z of [-1.45, 0, 1.45]) {
      res.push(ln(v(deck0, Y1, z), v(deck1, Y1, z), 0.16));
    }
    for (let x = deck0 + 0.9; x < deck1; x += 2.1) {
      res.push(ln(v(x, Y1, Z0 + 0.14), v(x, Y1, Z1 - 0.14), 0.12));
    }

    return res;
  }, [color]);

  return (
    <>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </>
  );
}

/** Subtle transparent fill that gives the ship a distinct background. */
function ShipHullFill({ color }: { color: string }) {
  return (
    <group>
      {/* Main hull body */}
      <mesh position={[7.9, -0.02, 0]} renderOrder={-1}>
        <boxGeometry args={[11.4, 1.2, 4.5]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>
      {/* Bridge superstructure */}
      <mesh position={[3.575, 1.63, 0]} renderOrder={-1}>
        <boxGeometry args={[2.2, 2.1, 2.1]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function Crane({ color }: { color: string }) {
  const lines = useMemo(() => {
    const result: THREE.Line[] = [];
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

    for (const cz of [CRANE_Z_NEG, CRANE_Z_POS]) {
      result.push(
        makeLine([v(CRANE_X0, 0, cz), v(CRANE_X0, CRANE_Y, cz)], color, 0.5),
      );
      result.push(
        makeLine([v(CRANE_X1, 0, cz), v(CRANE_X1, CRANE_Y, cz)], color, 0.5),
      );
      result.push(
        makeLine(
          [v(CRANE_X0, CRANE_Y, cz), v(CRANE_X1, CRANE_Y, cz)],
          color,
          0.6,
        ),
      );
      result.push(
        makeLine(
          [v(CRANE_X0, 0, cz), v(CRANE_X0 + 1.8, CRANE_Y, cz)],
          color,
          0.18,
        ),
      );
      result.push(
        makeLine(
          [v(CRANE_X1, 0, cz), v(CRANE_X1 - 1.8, CRANE_Y, cz)],
          color,
          0.18,
        ),
      );
    }

    for (let i = 0; i <= 10; i++) {
      const x = CRANE_X0 + ((CRANE_X1 - CRANE_X0) * i) / 10;
      result.push(
        makeLine(
          [v(x, CRANE_Y, CRANE_Z_NEG), v(x, CRANE_Y, CRANE_Z_POS)],
          color,
          0.15,
        ),
      );
    }

    return result;
  }, [color]);

  return (
    <group>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </group>
  );
}

// ─── Colors type ────────────────────────────────────────────────────────────
interface Colors {
  primary: string;
  structure: string;
  dim: string;
  dim2: string;
  water: string;
  shipHull: string;
}

// ─── Main scene orchestrator ────────────────────────────────────────────────
function SceneObjects({ colors }: { colors: Colors }) {
  const containerRef = useRef<THREE.Group>(null!);
  const trolleyRef = useRef<THREE.Group>(null!);
  const shipDepartRef = useRef<THREE.Group>(null!);
  const shipBobRef = useRef<THREE.Group>(null!);
  const progressRef = useRef(0);

  const cableLine = useMemo(
    () =>
      makeLine(
        [new THREE.Vector3(0, 0.2, 0), new THREE.Vector3(0, -4.1, 0)],
        colors.primary,
        0.8,
      ),
    [colors.primary],
  );

  useFrame(({ clock }, delta) => {
    progressRef.current = (progressRef.current + delta * ANIM_SPEED) % 1;
    const p = progressRef.current;
    const elapsed = clock.getElapsedTime();

    // ── Ship wave bob (always active) ─────────────────────────────────
    if (shipBobRef.current) {
      shipBobRef.current.position.y = Math.sin(elapsed * 0.45) * 0.06;
      shipBobRef.current.rotation.z = Math.sin(elapsed * 0.22) * 0.01;
    }

    // ── Ship departure / return offset ──────────────────────────────
    let shipOffset = 0;
    if (p >= T.DEPART_START && p < T.DEPART_END) {
      shipOffset =
        easeIn(norm(p, T.DEPART_START, T.DEPART_END)) * SHIP_DEPART_X;
    } else if (p >= T.DEPART_END && p < T.AWAY_END) {
      shipOffset = SHIP_DEPART_X;
    } else if (p >= T.AWAY_END && p < T.ARRIVE_END) {
      shipOffset =
        SHIP_DEPART_X * (1 - easeOut(norm(p, T.AWAY_END, T.ARRIVE_END)));
    }

    if (shipDepartRef.current) {
      shipDepartRef.current.position.x = shipOffset;
    }

    // ── Crane: active container position ──────────────────────────────
    let cX = YS_X;
    let cY = YS_Y;
    let cZ = YS_Z;
    let containerVisible = true;

    if (p < T.IDLE_END) {
      cX = YS_X;
      cY = YS_Y;
    } else if (p < T.LIFT_END) {
      const t = easeInOut(norm(p, T.IDLE_END, T.LIFT_END));
      cX = YS_X;
      cY = YS_Y + LIFT_H * t;
    } else if (p < T.TRAVERSE_END) {
      const t = easeInOut(norm(p, T.LIFT_END, T.TRAVERSE_END));
      cX = YS_X + (YE_X - YS_X) * t;
      cY = LIFT_H;
      cZ = YS_Z + (YE_Z - YS_Z) * t; // shift into cargo row during traverse
    } else if (p < T.LOWER_END) {
      const t = easeInOut(norm(p, T.TRAVERSE_END, T.LOWER_END));
      cX = YE_X;
      cY = LIFT_H + (YE_Y - LIFT_H) * t;
      cZ = YE_Z;
    } else if (p < T.DEPART_END) {
      // Container sits on ship deck, then sails away with it
      cX = YE_X + shipOffset;
      cY = YE_Y;
      cZ = YE_Z;
    } else if (p >= T.ARRIVE_END) {
      // Ship has returned — container reappears at yard for next cycle
      cX = YS_X;
      cY = YS_Y;
      cZ = YS_Z;
    } else {
      containerVisible = false;
    }

    if (containerRef.current) {
      containerRef.current.position.x = cX;
      containerRef.current.position.y = cY;
      containerRef.current.position.z = cZ;
      containerRef.current.visible = containerVisible;
    }

    // ── Crane: trolley position ───────────────────────────────────────
    let trolleyX = YS_X;

    if (p < T.PLACE_END) {
      trolleyX = cX; // follows the container
    } else if (p < T.RETRACT_END) {
      trolleyX = YE_X; // holds at ship while cable retracts
    } else if (p < T.RETURN_END) {
      const t = easeInOut(norm(p, T.RETRACT_END, T.RETURN_END));
      trolleyX = YE_X + (YS_X - YE_X) * t; // traverses back
    }
    // else: stays at YS_X (default)

    if (trolleyRef.current) {
      trolleyRef.current.position.x = trolleyX;
    }
  });

  return (
    <>
      <Water color={colors.water} />
      <YardGrid color={colors.structure} />
      <HarborCoast color={colors.structure} />

      {/* Ship — outer group handles departure offset, inner group handles wave bob */}
      <group ref={shipDepartRef}>
        <group ref={shipBobRef}>
          <ShipHull color={colors.structure} />
          <ShipHullFill color={colors.shipHull} />
          {SHIP_CONTAINERS.map((pos, i) => (
            <ShippingContainer
              key={`s${i}`}
              color={colors.dim2}
              position={pos}
              opacity={randomOpacity(i + 100)}
            />
          ))}
        </group>
      </group>

      <Crane color={colors.structure} />

      {/* Yard containers */}
      {YARD_POSITIONS.map((pos, i) => (
        <ShippingContainer
          key={i}
          color={colors.dim}
          position={pos}
          opacity={randomOpacity(i + 1)}
        />
      ))}

      {/* Crane trolley */}
      <group ref={trolleyRef} position={[YS_X, CRANE_Y, 0]}>
        <mesh>
          <boxGeometry args={[2, 0.45, CRANE_Z_POS - CRANE_Z_NEG]} />
          <meshBasicMaterial
            color={colors.structure}
            wireframe
            transparent
            opacity={0.75}
          />
        </mesh>
        <primitive object={cableLine} />
      </group>

      {/* Active container (moved by crane) */}
      <group ref={containerRef} position={[YS_X, YS_Y, YS_Z]}>
        <ShippingContainer color={colors.primary} position={[0, 0, 0]} />
      </group>
    </>
  );
}

// ─── Entry point ────────────────────────────────────────────────────────────
export default function ContainerYardScene() {
  const { resolvedTheme } = useTheme();
  const colors = resolvedTheme === "dark" ? PALETTE.dark : PALETTE.light;

  return (
    <Canvas
      camera={{ position: [15, 50, 20], fov: 12 }}
      onCreated={({ camera }) => {
        camera.lookAt(new THREE.Vector3(2, 0, 0));
      }}
    >
      <SceneObjects colors={colors} />
    </Canvas>
  );
}
