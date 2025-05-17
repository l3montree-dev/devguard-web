// @ts-nocheck
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Bloom, EffectComposer, LUT } from "@react-three/postprocessing";
import { LUTCubeLoader } from "postprocessing";
import { useCallback, useRef, useState } from "react";
import * as THREE from "three";
import { Beam } from "./components/Beam";
import { Flare } from "./components/Flare";
import { Prism } from "./components/Prism";
import { Rainbow } from "./components/Rainbow";
import { calculateRefractionAngle, lerp, lerpV3 } from "./util";

function Scene() {
  const [isPrismHit, hitPrism] = useState(true);
  const flare = useRef(null);
  const ambient = useRef(null);
  const spot = useRef(null);
  const boxreflect = useRef(null);
  const rainbow = useRef(null);
  const hasInteracted = useRef(false);
  const rayOut = useCallback(() => hitPrism(false), []);
  const rayOver = useCallback((e) => {
    // Break raycast so the ray stops when it touches the prism
    e.stopPropagation();
    hitPrism(true);
    // Set the intensity really high on first contact
    rainbow.current.material.speed = 1;
    rainbow.current.material.emissiveIntensity = 20;
  }, []);

  const vec = new THREE.Vector3();
  const rayMove = useCallback(({ api, position, direction, normal }) => {
    hasInteracted.current = true; // Mark as interacted
    if (!normal) return;
    // Extend the line to the prisms center
    vec.toArray(api.positions, api.number++ * 3);
    // Set flare
    flare.current.position.set(position.x, position.y, -0.5);
    flare.current.rotation.set(0, 0, -Math.atan2(direction.x, direction.y));
    // Calculate refraction angles
    let angleScreenCenter = Math.atan2(-position.y, -position.x);
    const normalAngle = Math.atan2(normal.y, normal.x);
    // The angle between the ray and the normal
    const incidentAngle = angleScreenCenter - normalAngle;
    // Calculate the refraction for the incident angle
    const refractionAngle = calculateRefractionAngle(incidentAngle) * 6;
    // Apply the refraction
    angleScreenCenter += refractionAngle;
    rainbow.current.rotation.z = angleScreenCenter;
    // Set spot light
    lerpV3(
      spot.current.target.position,
      [Math.cos(angleScreenCenter), Math.sin(angleScreenCenter), 0],
      0.05,
    );
    spot.current.target.updateMatrixWorld();
  }, []);

  useFrame((state) => {
    // Tie beam to the mouse
    let x = state.pointer.x;
    let y = state.pointer.y;
    if (state.pointer.x === 0 && state.pointer.y === 0) {
      // init with top left
      x = -1;
      y = 0.8;
    }

    boxreflect.current.setRay(
      [(x * state.viewport.width) / 2, (y * state.viewport.height) / 2, 0],
      [0, 0, 0],
    );

    // Animate rainbow intensity
    lerp(
      rainbow.current.material,
      "emissiveIntensity",
      isPrismHit ? 2.5 : 0,
      0.1,
    );
    spot.current.intensity = rainbow.current.material.emissiveIntensity;
    // Animate ambience
    lerp(ambient.current, "intensity", 0, 0.025);
  });

  return (
    <>
      {/* Lights */}
      <ambientLight ref={ambient} intensity={0} />
      <pointLight position={[10, -10, 0]} intensity={0.05} />
      <pointLight position={[0, 10, 0]} intensity={0.05} />
      <pointLight position={[-10, 0, 0]} intensity={0.05} />
      <spotLight
        ref={spot}
        intensity={1}
        distance={7}
        angle={1}
        penumbra={1}
        position={[0, 0, 1]}
      />

      {/* Prism + blocks + reflect beam */}
      <Beam ref={boxreflect} bounce={10} far={20}>
        <Prism
          position={[0, -0.5, 0]}
          onRayOver={rayOver}
          onRayOut={rayOut}
          onRayMove={rayMove}
        />
      </Beam>
      {/* Rainbow and flares */}
      <Rainbow
        ref={rainbow}
        startRadius={0}
        rotation={[0, 0, -Math.PI / 4]}
        endRadius={0.5}
        fade={0}
      />
      <Flare
        ref={flare}
        visible={isPrismHit}
        renderOrder={10}
        scale={1.25}
        streak={[12.5, 20, 1]}
      />
    </>
  );
}

const ThreeJSScene = () => {
  const texture = useLoader(LUTCubeLoader, "/lut/F-6800-STD.cube");
  return (
    <Canvas
      orthographic
      gl={{ antialias: false }}
      camera={{ position: [0, 0, 100], zoom: 70 }}
    >
      <color attach="background" args={["#0C1118"]} />
      <Scene />
      <EffectComposer disableNormalPass>
        <Bloom
          mipmapBlur
          levels={9}
          intensity={1.5}
          luminanceThreshold={1}
          luminanceSmoothing={1}
        />
        <LUT lut={texture} />
      </EffectComposer>
    </Canvas>
  );
};

export default ThreeJSScene;
