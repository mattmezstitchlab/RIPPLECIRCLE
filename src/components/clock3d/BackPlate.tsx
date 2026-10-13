/**
 * BackPlate — the flat mechanical back of the jewel.
 *
 * A circular brushed-titanium plate visible when the user flips the clock
 * (double-click or crown button). It houses:
 *   - engraved serial / calibre markings,
 *   - two crown-style knurled adjustment wheels (mode + zoom/explode),
 *   - a small screw-secured plate covering the "movement",
 *   - a F/R (front/return) pusher.
 *
 * The back intentionally evokes the case-back of a Swiss mechanical watch:
 * readable, tactile, machined — not a dashboard of buttons.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { MAT } from './lib/materials';
import type { ClockStateApi } from '../../hooks/clock/useClockState';

interface Props {
  clock: ClockStateApi;
}

export function BackPlate({ clock }: Props) {
  const crown1 = useRef<THREE.Mesh>(null);
  const crown2 = useRef<THREE.Mesh>(null);

  // Idle micro-rotation on the crowns to suggest precision movement.
  useFrame((_, dt) => {
    if (crown1.current && clock.playing) crown1.current.rotation.z += dt * 0.3;
    if (crown2.current && clock.playing) crown2.current.rotation.z -= dt * 0.2;
  });

  return (
    <group position={[0, 0, -0.95]}>
      {/* Main brushed back plate — same radius as the front bezel */}
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <cylinderGeometry args={[8.15, 8.15, 0.3, 96]} />
        <meshStandardMaterial color={0xc9c7bf} metalness={0.88} roughness={0.34} />
      </mesh>
      {/* Outer black bezel (same as front) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[8.15, 0.11, 12, 140]} />
        <meshStandardMaterial color={0x141414} metalness={0.75} roughness={0.45} />
      </mesh>
      {/* Inner recessed ring (machined groove) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.16]}>
        <torusGeometry args={[7.0, 0.03, 8, 140]} />
        <meshStandardMaterial color={0x141414} metalness={0.75} roughness={0.55} />
      </mesh>
      {/* Second groove */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.16]}>
        <torusGeometry args={[2.2, 0.025, 8, 100]} />
        <meshStandardMaterial color={0x141414} metalness={0.75} roughness={0.55} />
      </mesh>

      {/* Screw-secured movement cover (smaller circle with 6 screws) */}
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.18]}>
        <cylinderGeometry args={[4.2, 4.2, 0.08, 64]} />
        <meshStandardMaterial color={0xbdbab0} metalness={0.85} roughness={0.38} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.23]}>
        <torusGeometry args={[4.2, 0.025, 8, 100]} />
        <meshStandardMaterial color={0x141414} metalness={0.75} roughness={0.5} />
      </mesh>
      {/* 6 screws around the movement cover */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        return (
          <group key={i} rotation={[0, 0, a]} position={[Math.cos(a) * 4.2, Math.sin(a) * 4.2, 0.26]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.06, 24]} />
              <meshStandardMaterial color={0x141414} metalness={0.75} roughness={0.45} />
            </mesh>
            <mesh position={[0, 0, 0.04]}>
              <boxGeometry args={[0.18, 0.02, 0.02]} />
              <meshStandardMaterial color={0xf2f2f0} metalness={0.95} roughness={0.18} />
            </mesh>
          </group>
        );
      })}

      {/* Engraved text block — calibre branding */}
      <Text
        position={[0, 1.2, 0.26]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.22}
        color="#222"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.18}
      >
        RIPPLECIRCLE
      </Text>
      <Text
        position={[0, 0.85, 0.26]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.13}
        color="#444"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.3}
      >
        CALIBRE RC-01 · AUTOMATIQUE
      </Text>
      <Text
        position={[0, 0.55, 0.26]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.1}
        color="#666"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.22}
      >
        7 ANNEAUX · 216 COMPOSANTS · SWISS MADE
      </Text>

      {/* Central "jewel" (ruby-like) bearing */}
      <mesh position={[0, 0, 0.30]}>
        <cylinderGeometry args={[0.24, 0.24, 0.06, 24]} />
        <meshPhysicalMaterial color={0x8a1520} metalness={0.1} roughness={0.2} />
      </mesh>

      {/* Crown wheel 1 — left side, vertical knurled knob (MODE) */}
      <group position={[-8.3, 1.6, 0.28]}>
        <mesh ref={crown1} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.5, 48]} />
          <meshStandardMaterial color={0xd9d9d6} metalness={0.92} roughness={0.3} />
        </mesh>
        {/* Knurling texture via ring of tiny bumps */}
        {Array.from({ length: 32 }).map((_, i) => {
          const a = (i / 32) * Math.PI * 2;
          return (
            <mesh key={i} rotation={[0, 0, a]} position={[0.38, 0, 0]}>
              <boxGeometry args={[0.04, 0.48, 0.03]} />
              <meshStandardMaterial color={0x777} metalness={0.9} roughness={0.4} />
            </mesh>
          );
        })}
        <Text
          position={[0.9, 0, 0.15]}
          rotation={[0, 0, Math.PI / 2]}
          fontSize={0.18}
          color="#222"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.2}
        >
          MODE
        </Text>
      </group>

      {/* Crown wheel 2 — left lower (EXPLODED / FOCUS) */}
      <group position={[-8.3, -2.1, 0.28]}>
        <mesh ref={crown2} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.42, 48]} />
          <meshStandardMaterial color={0xd9d9d6} metalness={0.92} roughness={0.3} />
        </mesh>
        {Array.from({ length: 28 }).map((_, i) => {
          const a = (i / 28) * Math.PI * 2;
          return (
            <mesh key={i} rotation={[0, 0, a]} position={[0.32, 0, 0]}>
              <boxGeometry args={[0.04, 0.4, 0.03]} />
              <meshStandardMaterial color={0x777} metalness={0.9} roughness={0.4} />
            </mesh>
          );
        })}
        <Text
          position={[0.85, 0, 0.15]}
          rotation={[0, 0, Math.PI / 2]}
          fontSize={0.18}
          color="#222"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.2}
        >
          FOCUS
        </Text>
      </group>

      {/* Right pusher — FRONT / RETURN */}
      <group position={[8.3, 0, 0.28]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.36, 24]} />
          <meshStandardMaterial color={0x141414} metalness={0.75} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.08, 24]} />
          <meshStandardMaterial color={0xb9975b} metalness={0.9} roughness={0.3} />
        </mesh>
        <Text
          position={[-0.75, 0, 0.15]}
          rotation={[0, 0, -Math.PI / 2]}
          fontSize={0.18}
          color="#222"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.2}
        >
          F / R
        </Text>
      </group>

      {/* Subtle serial number at the bottom */}
      <Text
        position={[0, -6.6, 0.26]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.11}
        color="#555"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.3}
      >
        Nº 0001 / ÉDITION PROTOTYPE
      </Text>
      <Text
        position={[0, -6.3, 0.26]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.09}
        color="#777"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.2}
      >
        AJUSTEMENTS · 5 POSITIONS · RÉSERVE DE PROPAGATION
      </Text>

      {/* Clickable crown hotzone on the side (invisible) — flips back to front */}
      <mesh
        position={[8.3, 0, 0.3]}
        onClick={(e) => { e.stopPropagation(); clock.toggleFlip(); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = ''; }}
      >
        <cylinderGeometry args={[0.4, 0.4, 0.7, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

void MAT; // keep MAT import for future material tweaks
