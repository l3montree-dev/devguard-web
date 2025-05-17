import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Torus(props) {
  const meshRef = useRef();
  const sphereRef = useRef();
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x += 0.002;
    }
  });

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * 0.1) % 1;
    const pos = curve.getPoint(t);
    if (sphereRef.current) {
      sphereRef.current.position.copy(pos);
    }
  });

  const curve = useMemo(() => {
    class Infinity3D extends THREE.Curve {
      getPoint(t) {
        const angle = t * Math.PI * 2;
        const a = 2;
        const x = a * Math.cos(angle);
        const y = a * Math.sin(angle);
        const z = 0.5 * Math.sin(2 * angle); // Z offset to separate loops
        return new THREE.Vector3(x, y, z);
      }
    }

    return new Infinity3D();
  }, []);

  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, 300, 0.4, 32, true),
    [curve],
  );

  return (
    <>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1, 0.3, 300, 32]} />
        <meshStandardMaterial
          wireframe
          color="white"
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
    </>
  );
}

export function ThreeJSScene() {
  return (
    <Canvas camera-position-z={40} camera-far={100}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <Torus />
    </Canvas>
  );
}
