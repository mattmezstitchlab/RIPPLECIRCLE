/**
 * Ring — one concentric mechanical ring of the clock.
 *
 * Renders:
 *   - The extruded annulus body (beveled machined metal).
 *   - Inner + outer black torus rails.
 *   - Engraved ticks around the ring (long = every 6th, short = others).
 *   - Mechanical nodes (sphere pins on a stem), alternating black/silver.
 *   - Four visible screws on calendar & people rings.
 *   - Mounts on the ring group so that rotating the group rotates ticks + nodes together.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MAT } from './lib/materials';
import { makeAnnulusGeometry, type RingDef } from './lib/geometry';
import type { ClockStateApi } from '../../hooks/clock/useClockState';

interface Props {
  def: RingDef;
  index: number;
  baseZ: number;
  exploded: number;
  clock: ClockStateApi;
  /** Optional label callback for the i-th node (overrides defaults). */
  labelForNode?: (i: number) => { id: string; name: string };
}

// Pre-allocate shared geometries (reused across rings for GPU efficiency).
const tickGeo = new THREE.BoxGeometry(0.028, 0.18, 0.08);
const stemGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.18, 8);
const screwGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.12, 20);
const screwSlotGeo = new THREE.BoxGeometry(0.14, 0.02, 0.02);
const sphereGeo = new THREE.SphereGeometry(1, 22, 16);
const railGeoCache = new Map<number, THREE.TorusGeometry>();
function railGeo(r: number) {
  if (!railGeoCache.has(r)) railGeoCache.set(r, new THREE.TorusGeometry(r, 0.022, 8, 110));
  return railGeoCache.get(r)!;
}

export function Ring({ def, index, baseZ, exploded, clock, labelForNode }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const bodyGeometry = useMemo(() => makeAnnulusGeometry(def.radius, def.width, def.depth), [def.radius, def.width, def.depth]);
  const bodyMat = MAT[def.materialKey];
  const innerRail = def.radius - def.width / 2;
  const outerRail = def.radius + def.width / 2;

  // Ticks
  const ticks = useMemo(() => {
    const arr: { angle: number; long: boolean; dark: boolean }[] = [];
    for (let i = 0; i < def.tickCount; i++) {
      arr.push({ angle: (i / def.tickCount) * Math.PI * 2, long: i % 6 === 0, dark: i % 4 === 0 });
    }
    return arr;
  }, [def.tickCount]);

  // Nodes
  const nodes = useMemo(() => {
    const arr: { angle: number; scale: number; black: boolean; id: string; name: string }[] = [];
    for (let i = 0; i < def.nodeCount; i++) {
      const angle = (i / def.nodeCount) * Math.PI * 2 + index * 0.35;
      const scale = def.nodeRadius * (0.75 + (((i * 37) % 40) / 55));
      const black = i % 2 === 0;
      const override = labelForNode ? labelForNode(i) : null;
      const id = override?.id ?? `${def.id}-${String(i + 1).padStart(3, '0')}`;
      const name =
        override?.name ??
        (def.id === 'PEOPLE'
          ? `Personne ${i + 1}`
          : def.id === 'MOM'
            ? `Moment ${String(i + 1).padStart(2, '0')}`
            : `${def.name} Node ${i + 1}`);
      arr.push({ angle, scale, black, id, name });
    }
    return arr;
  }, [def.id, def.name, def.nodeCount, def.nodeRadius, index, labelForNode]);

  // Screws on outer rail for calendar + people
  const screws = useMemo(() => {
    if (def.id !== 'CAL' && def.id !== 'PEOPLE') return [] as number[];
    return [0.4, 0.4 + Math.PI / 2, 0.4 + Math.PI, 0.4 + (3 * Math.PI) / 2];
  }, [def.id]);

  // Idle rotation (only when playing, slower in non-instrument mode)
  useFrame((_, dt) => {
    const g = groupRef.current;
    if (!g) return;
    if (clock.playing) {
      const speedFactor = clock.mode === 'instrument' ? 1 : 0.35;
      g.rotation.z += def.idleSpeed * dt * speedFactor;
    }
    // Z offset for exploded view (middle ring = 0, outer rings spread outward)
    const targetZ = baseZ + (index - 3) * exploded * 1.05;
    g.position.z += (targetZ - g.position.z) * 0.12;
  });

  const longTickScale = 1.5;
  const shortTickScale = 0.75;

  return (
    <group ref={groupRef} position={[0, 0, baseZ]}>
      {/* Ring body — clickable for rotation drag + ring selection.
          Top cap is a flat annular ring (RingGeometry) placed at +depth/2 so
          we are guaranteed a machined top surface even if the extruded-bevel
          normals ever misbehave; it uses the same material as the body. */}
      <mesh
        castShadow
        receiveShadow
        geometry={bodyGeometry}
        material={bodyMat}
        onPointerOver={() => { document.body.style.cursor = 'grab'; }}
        onPointerOut={() => { if (clock.hoveredId === null) document.body.style.cursor = ''; }}
      />
      <mesh
        receiveShadow
        position={[0, 0, def.depth / 2 + 0.001]}
        material={bodyMat}
      >
        <ringGeometry args={[def.radius - def.width / 2 + 0.005, def.radius + def.width / 2 - 0.005, 96]} />
      </mesh>
      {/* Inner / outer rails */}
      <mesh geometry={railGeo(innerRail)} material={MAT.black} position={[0, 0, def.depth / 2 + 0.02]} />
      <mesh geometry={railGeo(outerRail)} material={MAT.black} position={[0, 0, def.depth / 2 + 0.02]} />
      {/* Ticks */}
      {ticks.map((t, i) => (
        <mesh
          key={`tick-${i}`}
          geometry={tickGeo}
          material={t.dark ? MAT.black : MAT.dark}
          scale={[1, t.long ? longTickScale : shortTickScale, 1]}
          position={[Math.cos(t.angle) * def.radius, Math.sin(t.angle) * def.radius, def.depth / 2 + 0.06]}
          rotation={[0, 0, t.angle + Math.PI / 2]}
        />
      ))}
      {/* Stems + spherical nodes */}
      {nodes.map((n, i) => {
        const x = Math.cos(n.angle) * def.radius;
        const y = Math.sin(n.angle) * def.radius;
        const isSelected = clock.selectedId === n.id;
        const isHovered = clock.hoveredId === n.id;
        const zBase = def.depth / 2 + n.scale * 0.65;
        return (
          <group key={`node-${i}`} position={[x, y, 0]} rotation={[0, 0, n.angle]}>
            <mesh geometry={stemGeo} material={MAT.black} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, def.depth / 2 + 0.05]} />
            <mesh
              castShadow
              geometry={sphereGeo}
              material={n.black ? matBlackInstance : matSilverInstance}
              scale={n.scale * (isHovered ? 1.35 : 1) * (isSelected ? 1.15 : 1)}
              position={[0, 0, zBase]}
              userData={{ isNode: true, id: n.id, name: n.name, ring: def, baseScale: n.scale }}
              onPointerOver={(e) => {
                e.stopPropagation();
                clock.setHoveredId(n.id);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                clock.setHoveredId(null);
                document.body.style.cursor = '';
              }}
              onClick={(e) => {
                e.stopPropagation();
                clock.setSelectedId(n.id);
              }}
            />
            {isSelected && (
              <mesh position={[0, 0, zBase + n.scale + 0.02]}>
                <torusGeometry args={[n.scale * 1.5, 0.012, 6, 40]} />
                <meshBasicMaterial color={0x111111} transparent opacity={0.4} />
              </mesh>
            )}
          </group>
        );
      })}
      {/* Four screws */}
      {screws.map((a, i) => (
        <group key={`screw-${i}`} rotation={[0, 0, a]}>
          <mesh geometry={screwGeo} material={MAT.black} rotation={[Math.PI / 2, 0, 0]} position={[outerRail, 0, def.depth / 2 + 0.08]} />
          <mesh geometry={screwSlotGeo} material={MAT.silver} position={[outerRail, 0, def.depth / 2 + 0.15]} rotation={[0, 0, 0]} />
        </group>
      ))}
    </group>
  );
}

// Per-ring-instance node materials so hover/selection scale does not mutate
// the shared MAT.black/MAT.silver used by other geometry.
const matBlackInstance = new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.75, roughness: 0.45 });
const matSilverInstance = new THREE.MeshStandardMaterial({ color: 0xf2f2f0, metalness: 0.95, roughness: 0.18 });
