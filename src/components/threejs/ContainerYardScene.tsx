// @ts-nocheck
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { ShippingContainer, makeLine } from "./ShippingContainer";

// Matches DevGuard design tokens: primary amber + dark-navy structural blue
const PRIMARY = "#F9BE24"; // hsl(43 95% 56%) — DevGuard primary
const STRUCTURE = "#4D7AB3"; // hsl(213 40% 50%) — structural wireframes
const DIM = "#1F4D80"; // hsl(213 60% 30%) — background yard containers
const DIM2 = "#122840"; // hsl(213 55% 17%) — already-loaded ship containers

// Aliases kept for readability
const CYAN = STRUCTURE;
const AMBER = PRIMARY;

const CRANE_Y = 5.5;
const CRANE_X0 = -10;
const CRANE_X1 = 13;
const CRANE_Z_NEG = -4;
const CRANE_Z_POS = 4;

const YS_X = -4;
const YS_Y = 0;
const YS_Z = 0;
const YE_X = 7;
const YE_Y = 0.9;
const LIFT_H = 4.5;

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function randomOpacity(seed: number): number {
  const v = Math.sin(seed);
  return Math.min(1, v + 1.5);
}

function YardGrid() {
  const lines = useMemo(() => {
    const result: THREE.Line[] = [];
    for (let x = -12; x <= 17; x += 2) {
      result.push(
        makeLine(
          [new THREE.Vector3(x, 0, -7), new THREE.Vector3(x, 0, 7)],
          CYAN,
          0.08,
        ),
      );
    }
    for (let z = -7; z <= 7; z += 2) {
      result.push(
        makeLine(
          [new THREE.Vector3(-12, 0, z), new THREE.Vector3(17, 0, z)],
          CYAN,
          0.08,
        ),
      );
    }
    return result;
  }, []);

  return (
    <group position={[0, -0.6, 0]}>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </group>
  );
}

function HarborCoast() {
  const lines = useMemo(() => {
    const res: THREE.Line[] = [];
    const v = (x: number, z: number) => new THREE.Vector3(x, 0, z);
    res.push(makeLine([v(1.0, -7), v(1.0, 7)], STRUCTURE, 0.45));
    for (let z = -6; z <= 6; z += 2) {
      res.push(makeLine([v(0.25, z), v(1.0, z)], STRUCTURE, 0.25));
    }
    return res;
  }, []);

  return (
    <group position={[0, -0.6, 0]}>
      <mesh position={[0.72, 0.02, 0]}>
        <boxGeometry args={[0.55, 0.03, 14]} />
        <meshBasicMaterial color={STRUCTURE} transparent opacity={0.12} />
      </mesh>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </group>
  );
}

function Ship() {
  const shipRef = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const res: THREE.Line[] = [];
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const ln = (a: THREE.Vector3, b: THREE.Vector3, op = 0.45) =>
      makeLine([a, b], CYAN, op);

    const X0 = 2.2,
      X1 = 13.6,
      Y0 = -0.62,
      Y1 = 0.58;
    const Z0 = -2.25,
      Z1 = 2.25,
      BOW_X = 15.2,
      BRIDGE_X = 5.0;

    res.push(ln(v(X0, Y0, Z0), v(X1, Y0, Z0), 0.55));
    res.push(ln(v(X0, Y1, Z0), v(X1, Y1, Z0), 0.55));
    res.push(ln(v(X0, Y0, Z1), v(X1, Y0, Z1), 0.55));
    res.push(ln(v(X0, Y1, Z1), v(X1, Y1, Z1), 0.55));
    res.push(ln(v(X0, Y0, Z0), v(X0, Y1, Z0), 0.42));
    res.push(ln(v(X0, Y0, Z1), v(X0, Y1, Z1), 0.42));
    res.push(ln(v(X0, Y0, Z0), v(X0, Y0, Z1), 0.48));
    res.push(ln(v(X0, Y1, Z0), v(X0, Y1, Z1), 0.48));
    res.push(ln(v(X0, (Y0 + Y1) / 2, Z0), v(X0, (Y0 + Y1) / 2, Z1), 0.22));
    res.push(ln(v(X1, Y0, Z0), v(BOW_X, Y0, 0), 0.5));
    res.push(ln(v(X1, Y0, Z1), v(BOW_X, Y0, 0), 0.5));
    res.push(ln(v(X1, Y1, Z0), v(BOW_X, Y1, 0), 0.5));
    res.push(ln(v(X1, Y1, Z1), v(BOW_X, Y1, 0), 0.5));
    res.push(ln(v(BOW_X, Y0, 0), v(BOW_X, Y1, 0), 0.42));

    for (let x = X0 + 1; x < X1; x += 1.2) {
      res.push(ln(v(x, Y0, Z0), v(x, Y1, Z0), 0.2));
      res.push(ln(v(x, Y0, Z1), v(x, Y1, Z1), 0.2));
    }

    res.push(ln(v(X0, 0, Z0), v(BOW_X, 0, Z0), 0.25));
    res.push(ln(v(X0, 0, Z1), v(BOW_X, 0, Z1), 0.25));
    res.push(ln(v(X0, Y0, 0), v(BOW_X, Y0, 0), 0.2));

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

    const sxCenter = (bx0 + bx1) / 2;
    const sy0 = Y1 + BH,
      sy1 = sy0 + 1.2;

    const mastX = sxCenter;
    res.push(ln(v(mastX, sy1, 0), v(mastX, sy1 + 1.1, 0), 0.36));
    res.push(
      ln(v(mastX - 0.45, sy1 + 0.75, 0), v(mastX + 0.45, sy1 + 0.75, 0), 0.2),
    );
    res.push(
      ln(
        v(mastX - 0.35, sy1 + 0.95, -0.3),
        v(mastX + 0.35, sy1 + 0.95, 0.3),
        0.14,
      ),
    );
    res.push(
      ln(
        v(mastX - 0.35, sy1 + 0.95, 0.3),
        v(mastX + 0.35, sy1 + 0.95, -0.3),
        0.14,
      ),
    );

    for (let y = Y1 + 0.45; y <= Y1 + 1.6; y += 0.38) {
      res.push(ln(v(bx1, y, -BZ), v(bx1, y, BZ), 0.18));
    }

    const deck0 = BRIDGE_X + 0.4,
      deck1 = X1 - 0.3;
    for (const z of [-1.45, 0, 1.45]) {
      res.push(ln(v(deck0, Y1, z), v(deck1, Y1, z), 0.16));
    }
    for (let x = deck0 + 0.9; x < deck1; x += 2.1) {
      res.push(ln(v(x, Y1, Z0 + 0.14), v(x, Y1, Z1 - 0.14), 0.12));
    }

    return res;
  }, []);

  useFrame(({ clock }) => {
    if (!shipRef.current) return;
    const t = clock.getElapsedTime();
    shipRef.current.position.y = Math.sin(t * 0.45) * 0.06;
    shipRef.current.rotation.z = Math.sin(t * 0.22) * 0.01;
  });

  return (
    <group ref={shipRef}>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </group>
  );
}

function Crane() {
  const lines = useMemo(() => {
    const result: THREE.Line[] = [];
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

    for (const cz of [CRANE_Z_NEG, CRANE_Z_POS]) {
      result.push(
        makeLine([v(CRANE_X0, 0, cz), v(CRANE_X0, CRANE_Y, cz)], CYAN, 0.5),
      );
      result.push(
        makeLine([v(CRANE_X1, 0, cz), v(CRANE_X1, CRANE_Y, cz)], CYAN, 0.5),
      );
      result.push(
        makeLine(
          [v(CRANE_X0, CRANE_Y, cz), v(CRANE_X1, CRANE_Y, cz)],
          CYAN,
          0.6,
        ),
      );
      result.push(
        makeLine(
          [v(CRANE_X0, 0, cz), v(CRANE_X0 + 1.8, CRANE_Y, cz)],
          CYAN,
          0.18,
        ),
      );
      result.push(
        makeLine(
          [v(CRANE_X1, 0, cz), v(CRANE_X1 - 1.8, CRANE_Y, cz)],
          CYAN,
          0.18,
        ),
      );
    }

    for (let i = 0; i <= 10; i++) {
      const x = CRANE_X0 + ((CRANE_X1 - CRANE_X0) * i) / 10;
      result.push(
        makeLine(
          [v(x, CRANE_Y, CRANE_Z_NEG), v(x, CRANE_Y, CRANE_Z_POS)],
          CYAN,
          0.15,
        ),
      );
    }

    return result;
  }, []);

  return (
    <group>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </group>
  );
}

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

const SHIP_CONTAINERS: [number, number, number][] = [
  [6.8, 0.9, -1.35],
  [6.8, 0.9, 1.35],
  [6.8, 2.1, -1.35],
  [8.9, 0.9, -1.35],
  [8.9, 0.9, 1.35],
  [8.9, 2.1, -1.35],
  [11.0, 0.9, -1.35],
  [11.0, 0.9, 1.35],
  [11.0, 2.1, -1.35],
  [11.0, 2.1, 1.35],
  [13.1, 0.9, -1.35],
  [13.1, 2.1, -1.35],
  [8.9, 3.3, -1.35],
  [8.9, 3.3, 1.35],
  [11.0, 3.3, -1.35],
];

function SceneObjects({ primary }: { primary: string }) {
  const containerRef = useRef<THREE.Group>(null!);
  const trolleyRef = useRef<THREE.Group>(null!);
  const progressRef = useRef(0);

  const cableLine = useMemo(
    () =>
      makeLine(
        [new THREE.Vector3(0, 0.2, 0), new THREE.Vector3(0, -4.1, 0)],
        primary,
        0.8,
      ),
    [primary],
  );

  useFrame((_, delta) => {
    progressRef.current = (progressRef.current + delta * 0.048) % 1;
    const p = progressRef.current;
    let cX: number, cY: number;

    if (p < 0.1) {
      cX = YS_X;
      cY = YS_Y;
    } else if (p < 0.28) {
      const t = easeInOut((p - 0.1) / 0.18);
      cX = YS_X;
      cY = YS_Y + LIFT_H * t;
    } else if (p < 0.58) {
      const t = easeInOut((p - 0.28) / 0.3);
      cX = YS_X + (YE_X - YS_X) * t;
      cY = LIFT_H;
    } else if (p < 0.7) {
      const t = easeInOut((p - 0.58) / 0.12);
      cX = YE_X;
      cY = LIFT_H + (YE_Y - LIFT_H) * t;
    } else if (p < 0.8) {
      cX = YE_X;
      cY = YE_Y;
    } else if (p < 0.88) {
      const t = easeInOut((p - 0.8) / 0.08);
      cX = YE_X;
      cY = YE_Y + LIFT_H * t;
    } else if (p < 0.95) {
      const t = easeInOut((p - 0.88) / 0.07);
      cX = YE_X + (YS_X - YE_X) * t;
      cY = YE_Y + LIFT_H;
    } else {
      const t = easeInOut((p - 0.95) / 0.05);
      cX = YS_X;
      cY = YE_Y + LIFT_H + (YS_Y - YE_Y - LIFT_H) * t;
    }

    if (containerRef.current) {
      containerRef.current.position.x = cX;
      containerRef.current.position.y = cY;
    }
    if (trolleyRef.current) {
      trolleyRef.current.position.x = cX;
    }
  });

  return (
    <>
      <YardGrid />
      <HarborCoast />
      <Ship />
      <Crane />
      {YARD_POSITIONS.map((pos, i) => (
        <ShippingContainer
          key={i}
          color={DIM}
          position={pos}
          opacity={randomOpacity(i + 1)}
        />
      ))}
      {SHIP_CONTAINERS.map((pos, i) => (
        <ShippingContainer
          key={`s${i}`}
          color={DIM2}
          position={pos}
          opacity={randomOpacity(i + 100)}
        />
      ))}
      <group ref={trolleyRef} position={[YS_X, CRANE_Y, 0]}>
        <mesh>
          <boxGeometry args={[2, 0.45, CRANE_Z_POS - CRANE_Z_NEG]} />
          <meshBasicMaterial
            color={CYAN}
            wireframe
            transparent
            opacity={0.75}
          />
        </mesh>
        <primitive object={cableLine} />
      </group>
      <group ref={containerRef} position={[YS_X, YS_Y, YS_Z]}>
        <ShippingContainer color={primary} position={[0, 0, 0]} />
      </group>
    </>
  );
}

export default function ContainerYardScene() {
  const { resolvedTheme } = useTheme();
  const primary = resolvedTheme === "dark" ? PRIMARY : "#000000";

  console.log(
    "ContainerYardScene render - theme:",
    resolvedTheme,
    "primary:",
    primary,
  );

  return (
    <Canvas
      camera={{ position: [15, 50, 20], fov: 12 }}
      onCreated={({ camera }) => {
        camera.lookAt(new THREE.Vector3(2, 0, 0));
      }}
    >
      <SceneObjects primary={primary} />
    </Canvas>
  );
}
