import { useMemo } from "react";
import * as THREE from "three";

export function makeLine(
  pts: THREE.Vector3[],
  color: string,
  opacity: number,
): THREE.Line {
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    linewidth: 2,
  });
  return new THREE.Line(geo, mat);
}

export function ShippingContainer({
  color,
  position,
  opacity = 1,
}: {
  color: string;
  position: [number, number, number];
  opacity?: number;
}) {
  const w = 2.6;
  const h = 1.2;
  const d = 1.0;

  const corners: [number, number, number][] = useMemo(
    () => [
      [-w / 2, -h / 2, -d / 2],
      [w / 2, -h / 2, -d / 2],
      [w / 2, h / 2, -d / 2],
      [-w / 2, h / 2, -d / 2],
      [-w / 2, -h / 2, d / 2],
      [w / 2, -h / 2, d / 2],
      [w / 2, h / 2, d / 2],
      [-w / 2, h / 2, d / 2],
    ],
    [],
  );

  const edgeLines = useMemo(() => {
    const pairs: [number, number][] = [
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
    return pairs.map(([a, b]) =>
      makeLine(
        [new THREE.Vector3(...corners[a]), new THREE.Vector3(...corners[b])],
        color,
        0.95 * opacity,
      ),
    );
  }, [corners, color, opacity]);

  const detailLines = useMemo(() => {
    const lines: THREE.Line[] = [];
    for (let i = 1; i < 10; i++) {
      const y = -h / 2 + h * (i / 10);
      lines.push(
        makeLine(
          [
            new THREE.Vector3(-w / 2, y, d / 2),
            new THREE.Vector3(w / 2, y, d / 2),
          ],
          color,
          0.5 * opacity,
        ),
      );
      lines.push(
        makeLine(
          [
            new THREE.Vector3(-w / 2, y, -d / 2),
            new THREE.Vector3(w / 2, y, -d / 2),
          ],
          color,
          0.5 * opacity,
        ),
      );
      lines.push(
        makeLine(
          [
            new THREE.Vector3(-w / 2, y, -d / 2),
            new THREE.Vector3(-w / 2, y, d / 2),
          ],
          color,
          0.5 * opacity,
        ),
      );
      lines.push(
        makeLine(
          [
            new THREE.Vector3(w / 2, y, -d / 2),
            new THREE.Vector3(w / 2, y, d / 2),
          ],
          color,
          0.5 * opacity,
        ),
      );
    }
    for (let i = 1; i < 8; i++) {
      const x = -w / 2 + w * (i / 8);
      lines.push(
        makeLine(
          [
            new THREE.Vector3(x, -h / 2, d / 2),
            new THREE.Vector3(x, h / 2, d / 2),
          ],
          color,
          0.5 * opacity,
        ),
      );
      lines.push(
        makeLine(
          [
            new THREE.Vector3(x, -h / 2, -d / 2),
            new THREE.Vector3(x, h / 2, -d / 2),
          ],
          color,
          0.5 * opacity,
        ),
      );
    }
    for (let i = 1; i < 8; i++) {
      const x = -w / 2 + w * (i / 8);
      for (const y of [-h / 2, h / 2]) {
        lines.push(
          makeLine(
            [new THREE.Vector3(x, y, -d / 2), new THREE.Vector3(x, y, d / 2)],
            color,
            0.45 * opacity,
          ),
        );
      }
    }
    lines.push(
      makeLine(
        [
          new THREE.Vector3(-w / 2, -h / 2, -d / 2),
          new THREE.Vector3(-w / 2, h / 2, d / 2),
        ],
        color,
        0.5 * opacity,
      ),
    );
    lines.push(
      makeLine(
        [
          new THREE.Vector3(-w / 2, h / 2, -d / 2),
          new THREE.Vector3(-w / 2, -h / 2, d / 2),
        ],
        color,
        0.5 * opacity,
      ),
    );
    lines.push(
      makeLine(
        [
          new THREE.Vector3(w / 2, -h / 2, -d / 2),
          new THREE.Vector3(w / 2, h / 2, d / 2),
        ],
        color,
        0.5 * opacity,
      ),
    );
    lines.push(
      makeLine(
        [
          new THREE.Vector3(w / 2, h / 2, -d / 2),
          new THREE.Vector3(w / 2, -h / 2, d / 2),
        ],
        color,
        0.5 * opacity,
      ),
    );
    return lines;
  }, [color, opacity]);

  return (
    <group position={position}>
      {edgeLines.map((obj: THREE.Line, i: number) => (
        <primitive key={i} object={obj} />
      ))}
      {detailLines.map((obj: THREE.Line, i: number) => (
        <primitive key={`d${i}`} object={obj} />
      ))}
      {corners.map((c, i) => (
        <mesh key={`c${i}`} position={c}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity}
            wireframe
            wireframeLinewidth={2}
          />
        </mesh>
      ))}
    </group>
  );
}
