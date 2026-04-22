"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import type * as THREE from "three";

function DoorModel({ rotate }: { rotate: boolean }) {
  const groupRef = useRef<THREE.Group | null>(null);

  useFrame((state, delta) => {
    if (!rotate) return;
    const g = groupRef.current;
    if (!g) return;
    g.rotation.y += delta * 0.18;
    g.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <group>
        {/* Door slab */}
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 2.05, 0.12]} />
          <meshStandardMaterial color="#0b1324" roughness={0.55} metalness={0.1} />
        </mesh>

        {/* Frame */}
        <mesh position={[0, 0.1, -0.09]} castShadow receiveShadow>
          <boxGeometry args={[1.16, 2.16, 0.05]} />
          <meshStandardMaterial color="#111827" roughness={0.7} metalness={0.05} />
        </mesh>

        {/* Accent strip */}
        <mesh position={[0.44, 0.1, 0.07]} castShadow>
          <boxGeometry args={[0.06, 2.02, 0.03]} />
          <meshStandardMaterial
            color="#ff6a1a"
            emissive="#ff6a1a"
            emissiveIntensity={0.35}
            roughness={0.35}
            metalness={0.2}
          />
        </mesh>

        {/* Handle */}
        <mesh position={[0.34, 0.12, 0.085]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.18, 18]} />
          <meshStandardMaterial color="#d6d3d1" roughness={0.25} metalness={0.9} />
        </mesh>
        <mesh position={[0.34, 0.12, 0.125]} castShadow>
          <boxGeometry args={[0.22, 0.03, 0.04]} />
          <meshStandardMaterial color="#d6d3d1" roughness={0.22} metalness={0.92} />
        </mesh>

        {/* Certification label */}
        <mesh position={[-0.32, -0.55, 0.081]} castShadow>
          <boxGeometry args={[0.34, 0.22, 0.01]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} metalness={0} />
        </mesh>
        <mesh position={[-0.32, -0.55, 0.086]}>
          <boxGeometry args={[0.3, 0.03, 0.005]} />
          <meshStandardMaterial color="#ff6a1a" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
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

  if (webglOk !== true) {
    // User requested “3D only” — when WebGL is unavailable we show a clear message
    // instead of swapping in a static image.
    return (
      <div className="aspect-video w-full bg-hero-gradient">
        <div className="flex h-full w-full items-center justify-center px-8 text-center">
          <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm font-semibold text-primary-foreground">
              3D preview unavailable
            </p>
            <p className="mt-2 text-sm leading-relaxed text-primary-foreground/70">
              Your browser couldn’t create a WebGL context (common in VM/sandboxed
              GPU setups). Enable hardware acceleration/WebGL, or run outside the
              VM to see the rotating 3D door.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full bg-hero-gradient">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "default" }}
        camera={{ position: [0, 0.25, 3.2], fov: 38, near: 0.1, far: 50 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        onError={() => setWebglOk(false)}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[3.5, 4.5, 2.5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-2.5, 1.5, 3]} intensity={0.6} />

        <group position={[0, -0.25, 0]}>
          <DoorModel rotate={!reduceMotion} />
          <ContactShadows
            position={[0, -1.05, 0]}
            opacity={0.55}
            blur={2.2}
            scale={6}
            far={3.5}
          />
        </group>
      </Canvas>
    </div>
  );
}

