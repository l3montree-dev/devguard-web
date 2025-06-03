// @ts-nocheck
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";

import {
  CameraControls,
  Edges,
  Environment,
  MeshPortalMaterial,
  useGLTF,
} from "@react-three/drei";

function Side({ rotation = [0, 0, 0], bg = "#f0f0f0", children, index }) {
  const meshRef = useRef();
  const sideRef = useRef();

  const { nodes } = useGLTF("/aobox-transformed.glb");
  useFrame((state, delta) => {
    meshRef.current.rotation.x = meshRef.current.rotation.y += delta / 2;
    sideRef.current.rotation.x += delta / 12;
    sideRef.current.rotation.y += delta / 12;
  });
  return (
    <MeshPortalMaterial worldUnits={true} attach={`material-${index}`}>
      {/** Everything in here is inside the portal and isolated from the canvas */}
      <ambientLight intensity={0.5} />

      <Environment preset="warehouse" />
      {/** A box with baked AO */}
      <pointLight position={[2, 2, 2]} intensity={1.5} castShadow />
      <mesh
        castShadow
        receiveShadow
        ref={sideRef}
        rotation={rotation}
        geometry={nodes.Cube.geometry}
      >
        <meshStandardMaterial
          aoMapIntensity={1}
          aoMap={nodes.Cube.material.aoMap}
          color={bg}
        />
        <spotLight
          castShadow
          color={bg}
          intensity={2}
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          shadow-normalBias={0.05}
          shadow-bias={0.0001}
        />
      </mesh>
      {/** The shape */}
      <mesh castShadow receiveShadow ref={meshRef}>
        {children}
        <meshStandardMaterial wireframe color={bg} />
      </mesh>
    </MeshPortalMaterial>
  );
}

const Cube = () => {
  const meshRef = useRef();
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta / 12;
    meshRef.current.rotation.y += delta / 12;
  });
  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <boxGeometry args={[2, 2, 2]} />

      <Side rotation={[0, 0, 0]} bg="#F9BE24" index={0}>
        <torusGeometry args={[0.65, 0.3, 64]} />
      </Side>
      <Side rotation={[0, Math.PI, 0]} bg="#F9BE24" index={1}>
        <torusKnotGeometry args={[0.55, 0.2, 128, 32]} />
      </Side>
      <Side rotation={[0, Math.PI / 2, Math.PI / 2]} bg="#62748e" index={2}>
        <boxGeometry args={[1.15, 1.15, 1.15]} />
      </Side>
      <Side rotation={[0, Math.PI / 2, -Math.PI / 2]} bg="#62748e" index={3}>
        <octahedronGeometry />
      </Side>
      <Side rotation={[0, -Math.PI / 2, 0]} bg="white" index={4}>
        <icosahedronGeometry />
      </Side>
      <Side rotation={[0, Math.PI / 2, 0]} bg="white" index={5}>
        <dodecahedronGeometry />
      </Side>
    </mesh>
  );
};

const ThreeJSScene = () => {
  return (
    <Canvas shadows camera={{ position: [-3, 0.5, 3] }}>
      <Cube />
      <CameraControls makeDefault />
    </Canvas>
  );
};

export default ThreeJSScene;
