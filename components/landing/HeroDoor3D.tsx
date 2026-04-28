"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Canvas, useFrame } from "@react-three/fiber";
import type * as THREE from "three";

function DoorModel() {
  const groupRef = useRef<THREE.Group | null>(null);

  return (
    <group ref={groupRef} rotation={[0.02, -0.35, 0]}>
      <group>
        {/* Double fire doors (reference-inspired) */}
        <mesh position={[-0.28, 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 2.05, 0.1]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.7} metalness={0.02} />
        </mesh>
        <mesh position={[0.28, 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 2.05, 0.1]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.7} metalness={0.02} />
        </mesh>

        {/* Center seam */}
        <mesh position={[0, 0.1, 0.053]} castShadow>
          <boxGeometry args={[0.02, 2.02, 0.01]} />
          <meshStandardMaterial color="#9ca3af" roughness={0.85} metalness={0.02} />
        </mesh>

        {/* Window panels */}
        <mesh position={[-0.28, 0.55, 0.055]} castShadow>
          <boxGeometry args={[0.22, 0.55, 0.02]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.25} metalness={0.05} />
        </mesh>
        <mesh position={[0.28, 0.55, 0.055]} castShadow>
          <boxGeometry args={[0.22, 0.55, 0.02]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.25} metalness={0.05} />
        </mesh>

        {/* Push bar */}
        <mesh position={[0, -0.15, 0.07]} castShadow>
          <boxGeometry args={[0.92, 0.05, 0.04]} />
          <meshStandardMaterial color="#d6d3d1" roughness={0.22} metalness={0.9} />
        </mesh>
        <mesh position={[0, -0.15, 0.09]} castShadow>
          <boxGeometry args={[0.22, 0.08, 0.02]} />
          <meshStandardMaterial color="#d6d3d1" roughness={0.25} metalness={0.92} />
        </mesh>

        {/* Subtle brand red accent */}
        <mesh position={[0.52, 0.1, 0.06]} castShadow>
          <boxGeometry args={[0.04, 2.02, 0.02]} />
          <meshStandardMaterial
            color="#d10000"
            emissive="#d10000"
            emissiveIntensity={0.18}
            roughness={0.35}
            metalness={0.15}
          />
        </mesh>
      </group>
    </group>
  );
}

function Rig({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group | null>(null);
  useFrame((state, delta) => {
    if (!enabled) return;
    const g = ref.current;
    if (!g) return;
    // pointer: [-1..1] range
    const px = state.pointer.x;
    const py = state.pointer.y;
    const targetX = -py * 0.08;
    const targetY = px * 0.14;
    g.rotation.x += (targetX - g.rotation.x) * Math.min(1, delta * 6);
    g.rotation.y += (targetY - g.rotation.y) * Math.min(1, delta * 6);
  });
  return <group ref={ref}>{children}</group>;
}

export function HeroDoor3D() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [webglOk, setWebglOk] = useState<boolean | null>(null);

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduceMotion(Boolean(mql?.matches));
    onChange();
    mql?.addEventListener?.("change", onChange);
    return () => mql?.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    // Preflight WebGL so we never mount a <Canvas> on machines
    // that can't create a context (common on VMs / sandboxed GPUs).
    try {
      const canvas = document.createElement("canvas");
      // Be permissive: allow WebGL2/WebGL and allow software rendering if needed.
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      const ok = Boolean(gl);
      // Defer state update to avoid synchronous setState-in-effect lint.
      requestAnimationFrame(() => setWebglOk(ok));
    } catch {
      requestAnimationFrame(() => setWebglOk(false));
    }
  }, []);

  const wrapperClass =
    "relative w-full overflow-hidden aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4]";

  if (webglOk !== true) {
    return (
      <div className={wrapperClass}>
        <Image
          src="/hero-firedoor.jpg"
          alt="Modern fire-rated door with certification label in a commercial corridor"
          fill
          sizes="(max-width: 1024px) 100vw, 520px"
          className="object-cover"
          priority
        />
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <Canvas
        className="absolute inset-0"
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "default" }}
        camera={{ position: [0, 0.18, 3.6], fov: 30, near: 0.1, far: 50 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        onError={() => setWebglOk(false)}
      >
        <ambientLight intensity={0.6} />
        {/* Rim light to separate the grey door from the dark hero gradient */}
        <directionalLight position={[-4, 2.5, -2]} intensity={0.55} />
        <directionalLight
          position={[3.5, 4.5, 2.5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-2.5, 1.5, 3]} intensity={0.6} />

        <group position={[0, -0.18, 0]} scale={0.9}>
          <Rig enabled={!reduceMotion}>
            <DoorModel />
          </Rig>
        </group>
      </Canvas>
    </div>
  );
}

