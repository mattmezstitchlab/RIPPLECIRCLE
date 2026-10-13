/**
 * Nucleus — faceted geometric core at the center of the clock.
 * Rotates slowly on its own axes and is the default selected entity.
 * Represents identity / intentions / equilibrium / alignment.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MAT } from './lib/materials';
import type { ClockStateApi } from '../../hooks/clock/useClockState';

interface Props {
  clock: ClockStateApi;
}

export function Nucleus({ clock }: Props) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const cage1 = useRef<THREE.Mesh>(null);
  const cage2 = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (!group.current) return;
    if (clock.playing) {
      group.current.rotation.y += dt * 0.4;
      group.current.rotation.x += dt * 0.18;
    }
    if (cage1.current) cage1.current.rotation.z += dt * 0.3;
    if (cage2.current) cage2.current.rotation.z -= dt * 0.5;
    // Pulse on ripple trigger
    const k = clock.rippleKey;
    if (core.current && (core.current.userData.pulseKey ?? -1) !== k) {
      core.current.userData.pulseKey = k;
      core.current.userData.pulseAt = performance.now();
    }
    if (core.current?.userData.pulseAt) {
      const d = (performance.now() - core.current.userData.pulseAt) / 500;
      const s = d > 0 && d < 1 ? 1 + Math.sin(d * Math.PI) * 0.12 : 1;
      const selected = clock.selectedId === 'CORE-001';
      const hovered = clock.hoveredId === 'CORE-001';
      const scale = s * (hovered ? 1.15 : 1) * (selected ? 1.08 : 1);
      core.current.scale.setScalar(scale);
      if (d >= 1) delete core.current.userData.pulseAt;
    }
  });

  const isSelected = clock.selectedId === 'CORE-001';
  const isHovered = clock.hoveredId === 'CORE-001';

  return (
    <group ref={group} position={[0, 0, 0.9]}>
      <mesh
        ref={core}
        castShadow
        geometry={coreGeo}
        material={coreMat}
        userData={{
          isNode: true,
          id: 'CORE-001',
          name: 'Noyau Identitaire',
          ring: { id: 'CORE', name: 'NUCLEUS' },
          baseScale: 1
        }}
        onPointerOver={(e) => { e.stopPropagation(); clock.setHoveredId('CORE-001'); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { clock.setHoveredId(null); document.body.style.cursor = ''; }}
        onClick={(e) => {
          e.stopPropagation();
          clock.setSelectedId('CORE-001');
        }}
      />
      {/* Icosahedral wireframe cage */}
      <mesh ref={cage1} geometry={cageGeo} material={wireMat} />
      {/* Two orbital silver rings */}
      <mesh ref={cage2}>
        <torusGeometry args={[0.95, 0.025, 8, 80]} />
        <meshStandardMaterial color={0xf2f2f0} metalness={0.95} roughness={0.18} />
      </mesh>
      <mesh rotation={[1.1, 0.7, 0]}>
        <torusGeometry args={[1.08, 0.025, 8, 80]} />
        <meshStandardMaterial color={0xf2f2f0} metalness={0.95} roughness={0.18} />
      </mesh>
      {/* 8 satellite bead nodes around the nucleus */}
      {beadPositions.map(([x, y], i) => (
        <mesh key={i} castShadow position={[x, y, 0]}>
          <sphereGeometry args={[0.07, 12, 10]} />
          <meshStandardMaterial color={0x141414} metalness={0.75} roughness={0.45} />
        </mesh>
      ))}
      {/* Selected halo */}
      {isSelected && (
        <mesh>
          <torusGeometry args={[1.35, 0.012, 6, 80]} />
          <meshBasicMaterial color={0x111111} transparent opacity={0.35} />
        </mesh>
      )}
      {isHovered && !isSelected && (
        <mesh>
          <torusGeometry args={[1.32, 0.012, 6, 80]} />
          <meshBasicMaterial color={0xb9975b} transparent opacity={0.55} />
        </mesh>
      )}
    </group>
  );
}

const coreGeo = new THREE.SphereGeometry(0.78, 32, 24);
const coreMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.95, roughness: 0.22 });
const cageGeo = new THREE.IcosahedronGeometry(0.92, 0);
const wireMat = new THREE.MeshBasicMaterial({ color: 0x111111, wireframe: true, transparent: true, opacity: 0.55 });
const beadPositions: [number, number][] = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  return [Math.cos(a) * 1.25, Math.sin(a) * 1.25];
});

// NOTE: MAT is imported for type/side-reference but we use inline materials above
// for the nucleus because we need unique instances so setScalar/hover works without
// mutating shared materials. Keep import to satisfy tree-shaking.
void MAT;
