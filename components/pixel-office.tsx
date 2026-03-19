'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AgentData = {
  name: string;
  role: string;
  color: string;
  initial: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AGENTS: AgentData[] = [
  { name: 'George', role: 'main', color: '#3b82f6', initial: 'G' },
  { name: 'Rex', role: 'coder', color: '#f97316', initial: 'R' },
  { name: 'Leo', role: 'content', color: '#22c55e', initial: 'L' },
  { name: 'Iris', role: 'analyst', color: '#ec4899', initial: 'I' },
  { name: 'Atlas', role: 'librarian', color: '#8b5cf6', initial: 'A' },
  { name: 'Scout', role: 'trend', color: '#06b6d4', initial: 'S' },
  { name: 'Hugo', role: 'leads', color: '#ef4444', initial: 'H' },
];

const CIRCLE_RADIUS = 8;
const TERRAIN_SIZE = 40;
const MAX_TREES = 15;
const MAX_ANIMALS = 6;

// ---------------------------------------------------------------------------
// Helpers — deterministic pseudo-random from seed so layout is stable
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Voxel-style agent character with initial-letter sprite above their head. */
function Agent({
  agent,
  position,
}: {
  agent: AgentData;
  position: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Gentle idle bob
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(clock.getElapsedTime() * 1.4 + position[0]) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh castShadow={false} position={[0, 0.5, 0]}>
        <boxGeometry args={[0.6, 1, 0.4]} />
        <meshStandardMaterial color={agent.color} />
      </mesh>

      {/* Head */}
      <mesh castShadow={false} position={[0, 1.3, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={agent.color} toneMapped={false} />
      </mesh>

      {/* Left leg */}
      <mesh castShadow={false} position={[-0.15, -0.1, 0]}>
        <boxGeometry args={[0.22, 0.5, 0.3]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Right leg */}
      <mesh castShadow={false} position={[0.15, -0.1, 0]}>
        <boxGeometry args={[0.22, 0.5, 0.3]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Initial label — small sprite above head */}
      <sprite position={[0, 1.85, 0]} scale={[0.3, 0.3, 1]}>
        <spriteMaterial color={agent.color} />
      </sprite>

      {/* HTML overlay for the letter — positioned above the sprite */}
      <Html
        position={[0, 1.85, 0]}
        center
        distanceFactor={12}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: 13,
            color: '#fff',
            textShadow: '0 1px 3px rgba(0,0,0,0.6)',
            userSelect: 'none',
          }}
        >
          {agent.initial}
        </div>
      </Html>
    </group>
  );
}

/** Central office building — larger voxel block with a door and window detail. */
function CentralBuilding() {
  return (
    <group position={[0, 0, 0]}>
      {/* Main structure */}
      <mesh castShadow={false} position={[0, 1.5, 0]}>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      {/* Roof */}
      <mesh castShadow={false} position={[0, 3.25, 0]}>
        <boxGeometry args={[3.4, 0.5, 3.4]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Door */}
      <mesh castShadow={false} position={[0, 0.6, 1.51]}>
        <boxGeometry args={[0.8, 1.2, 0.05]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Window left */}
      <mesh castShadow={false} position={[-0.8, 1.8, 1.51]}>
        <boxGeometry args={[0.5, 0.5, 0.05]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#7dd3fc" emissiveIntensity={0.3} />
      </mesh>

      {/* Window right */}
      <mesh castShadow={false} position={[0.8, 1.8, 1.51]}>
        <boxGeometry args={[0.5, 0.5, 0.05]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#7dd3fc" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/** Simple voxel tree — green cone on brown cylinder trunk. */
function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh castShadow={false} position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.8, 6]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>

      {/* Canopy */}
      <mesh castShadow={false} position={[0, 1.2, 0]}>
        <coneGeometry args={[0.7, 1.4, 6]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>
    </group>
  );
}

/** Tiny voxel animal — a small colored box with a darker "head" box. */
function Animal({
  position,
  bodyColor,
}: {
  position: [number, number, number];
  bodyColor: string;
}) {
  return (
    <group position={position}>
      {/* Body */}
      <mesh castShadow={false} position={[0, 0.15, 0]}>
        <boxGeometry args={[0.4, 0.25, 0.25]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Head */}
      <mesh castShadow={false} position={[0.22, 0.22, 0]}>
        <boxGeometry args={[0.18, 0.18, 0.2]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
    </group>
  );
}

/** Ground plane — the only element that receives shadows. */
function Ground() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      receiveShadow
    >
      <planeGeometry args={[TERRAIN_SIZE, TERRAIN_SIZE]} />
      <meshStandardMaterial color="#86efac" />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Scene — composes all elements
// ---------------------------------------------------------------------------

function Scene() {
  // Compute agent positions in a circle
  const agentPositions = useMemo<[number, number, number][]>(() => {
    const step = (2 * Math.PI) / AGENTS.length;
    return AGENTS.map((_, i) => {
      const angle = step * i;
      return [
        Math.cos(angle) * CIRCLE_RADIUS,
        0,
        Math.sin(angle) * CIRCLE_RADIUS,
      ] as [number, number, number];
    });
  }, []);

  // Deterministic random tree positions (avoid centre and agent ring)
  const treePositions = useMemo<[number, number, number][]>(() => {
    const rand = seededRandom(42);
    const positions: [number, number, number][] = [];
    const half = TERRAIN_SIZE / 2 - 1;

    let attempts = 0;
    while (positions.length < MAX_TREES && attempts < 200) {
      attempts++;
      const x = (rand() - 0.5) * 2 * half;
      const z = (rand() - 0.5) * 2 * half;
      const distFromCentre = Math.sqrt(x * x + z * z);

      // Keep trees away from the building (r < 4) and the agent ring (7-9)
      if (distFromCentre < 4 || (distFromCentre > 6.5 && distFromCentre < 9.5)) {
        continue;
      }
      positions.push([x, 0, z]);
    }
    return positions;
  }, []);

  // Deterministic random animal positions
  const animalData = useMemo(() => {
    const rand = seededRandom(137);
    const colors = ['#d97706', '#dc2626', '#9333ea', '#0891b2', '#65a30d', '#be185d'];
    const half = TERRAIN_SIZE / 2 - 2;
    const items: { position: [number, number, number]; color: string }[] = [];

    let attempts = 0;
    while (items.length < MAX_ANIMALS && attempts < 200) {
      attempts++;
      const x = (rand() - 0.5) * 2 * half;
      const z = (rand() - 0.5) * 2 * half;
      const dist = Math.sqrt(x * x + z * z);

      if (dist < 5 || (dist > 6.5 && dist < 9.5)) continue;
      items.push({
        position: [x, 0, z],
        color: colors[items.length % colors.length],
      });
    }
    return items;
  }, []);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.0}
        castShadow={false}
      />

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.12}
        minDistance={6}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.2}
      />

      {/* Ground */}
      <Ground />

      {/* Central building */}
      <CentralBuilding />

      {/* Agents in circle layout */}
      {AGENTS.map((agent, i) => (
        <Agent key={agent.name} agent={agent} position={agentPositions[i]} />
      ))}

      {/* Trees */}
      {treePositions.map((pos, i) => (
        <Tree key={`tree-${i}`} position={pos} />
      ))}

      {/* Animals */}
      {animalData.map((a, i) => (
        <Animal key={`animal-${i}`} position={a.position} bodyColor={a.color} />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Exported component
// ---------------------------------------------------------------------------

export function PixelOffice() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100vh', background: '#0f172a' }}>
      <Canvas
        dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1)}
        gl={{ antialias: true }}
        camera={{ position: [14, 12, 14], fov: 50, near: 0.1, far: 200 }}
        shadows={false}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
