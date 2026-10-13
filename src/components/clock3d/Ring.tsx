/**
 * Ring — one concentric mechanical ring.
 *
 * Body is built as a flat cylinder (disk) with the appropriate outer & inner
 * radii. CylinderGeometry creates a perfect top/side/bottom disk with
 * guaranteed correct normals, so lighting always shows the machined-metal
 * top face. We layer two black torus rails on top (inner & outer rim) plus
 * ticks, nodes, stems and screws.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MAT } from './lib/materials';
import type { RingDef } from './lib/geometry';
import type { ClockStateApi } from '../../hooks/clock/useClockState';

interface Props {
  def: RingDef;
  index: number;
  baseZ: number;
  exploded: number;
  clock: ClockStateApi;
  labelForNode?: (i: number) => { id: string; name: string };
}

const tickGeo = new THREE.BoxGeometry(0.028, 0.16, 0.07);
const stemGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.18, 8);
const screwGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.10, 20);
const screwSlotGeo = new THREE.BoxGeometry(0.14, 0.02, 0.02);
const sphereGeo = new THREE.SphereGeometry(1, 22, 16);
const railCache = new Map<number, THREE.TorusGeometry>();
function railGeo(r: number) {
  if (!railCache.has(r)) railCache.set(r, new THREE.TorusGeometry(r, 0.022, 8, 120));
  return railCache.get(r)!;
}

export function Ring({ def, index, baseZ, exploded, clock, labelForNode }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyMat = MAT[def.materialKey];
  const innerR = def.radius - def.width / 2;
  const outerR = def.radius + def.width / 2;

  const bodyGeo = useMemo(() => {
    // RingGeometry gives us the flat annular disk with front face pointing
    // toward +Z (the camera in 3/4 view) — perfect for a machined top.
    return new THREE.RingGeometry(innerR + 0.01, outerR - 0.01, 96);
  }, [innerR, outerR]);

  // Side wall (a Torus as a subtle beveled edge for depth)
  const sideGeo = useMemo(() => new THREE.TorusGeometry(def.radius, def.depth / 2, 10, 96), [def.radius, def.depth]);

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

  const screws = useMemo(() => {
    if (def.id !== 'CAL' && def.id !== 'PEOPLE') return [] as number[];
    return [0.4, 0.4 + Math.PI / 2, 0.4 + Math.PI, 0.4 + (3 * Math.PI) / 2];
  }, [def.id]);

  useFrame((_, dt) => {
    const g = groupRef.current;
    if (!g) return;
    if (clock.playing) {
      const sf = clock.mode === 'instrument' ? 1 : 0.35;
      g.rotation.z += def.idleSpeed * dt * sf;
    }
    const targetZ = baseZ + (index - 3) * exploded * 1.05;
    g.position.z += (targetZ - g.position.z) * 0.12;
  });

  const topZ = def.depth / 2 + 0.001;

  return (
    <group ref={groupRef} position={[0, 0, baseZ]}>
      {/* Side wall (dark metallic bevel for contrast/depth) */}
      <mesh
        castShadow
        receiveShadow
        geometry={sideGeo}
        material={bevelMat}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onPointerOver={() => { document.body.style.cursor = 'grab'; }}
        onPointerOut={() => { if (clock.hoveredId === null) document.body.style.cursor = ''; }}
      />
      {/* Top face — the visible machined-metal disk */}
      <mesh
        receiveShadow
        geometry={bodyGeo}
        material={bodyMat}
        position={[0, 0, topZ]}
      />
      {/* Inner + outer rails on top */}
      <mesh geometry={railGeo(innerR)} material={MAT.black} position={[0, 0, topZ + 0.02]} />
      <mesh geometry={railGeo(outerR)} material={MAT.black} position={[0, 0, topZ + 0.02]} />
      {/* Ticks */}
      {ticks.map((t, i) => (
        <mesh
          key={`tick-${i}`}
          geometry={tickGeo}
          material={t.dark ? MAT.black : MAT.dark}
          scale={[1, t.long ? 1.5 : 0.75, 1]}
          position={[Math.cos(t.angle) * def.radius, Math.sin(t.angle) * def.radius, topZ + 0.08]}
          rotation={[0, 0, t.angle + Math.PI / 2]}
        />
      ))}
      {/* Nodes */}
      {nodes.map((n, i) => {
        const x = Math.cos(n.angle) * def.radius;
        const y = Math.sin(n.angle) * def.radius;
        const isSelected = clock.selectedId === n.id;
        const isHovered = clock.hoveredId === n.id;
        const zNode = topZ + 0.06 + n.scale * 0.7;
        return (
          <group key={`node-${i}`} position={[x, y, 0]} rotation={[0, 0, n.angle]}>
            <mesh geometry={stemGeo} material={MAT.black} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, topZ + 0.08]} />
            <mesh
              castShadow
              geometry={sphereGeo}
              material={n.black ? matBlack : matSilver}
              scale={n.scale * (isHovered ? 1.35 : 1) * (isSelected ? 1.15 : 1)}
              position={[0, 0, zNode]}
              userData={{ isNode: true, id: n.id, name: n.name, ring: def, baseScale: n.scale }}
              onPointerOver={(e) => { e.stopPropagation(); clock.setHoveredId(n.id); document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { clock.setHoveredId(null); document.body.style.cursor = ''; }}
              onClick={(e) => { e.stopPropagation(); clock.setSelectedId(n.id); }}
            />
            {isSelected && (
              <mesh position={[0, 0, zNode + n.scale + 0.02]}>
                <torusGeometry args={[n.scale * 1.5, 0.012, 6, 40]} />
                <meshBasicMaterial color={0x111111} transparent opacity={0.45} />
              </mesh>
            )}
          </group>
        );
      })}
      {/* Screws */}
      {screws.map((a, i) => (
        <group key={`screw-${i}`} rotation={[0, 0, a]}>
          <mesh geometry={screwGeo} material={MAT.black} rotation={[Math.PI / 2, 0, 0]} position={[outerR, 0, topZ + 0.08]} />
          <mesh geometry={screwSlotGeo} material={MAT.silver} position={[outerR, 0, topZ + 0.14]} rotation={[0, 0, 0]} />
        </group>
      ))}
    </group>
  );
}

// Per-ring node material instances so hover/selection scale doesn't mutate
// shared materials used by other geometry.
const matBlack = new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.75, roughness: 0.4 });
const matSilver = new THREE.MeshStandardMaterial({ color: 0xf2f2f0, metalness: 0.95, roughness: 0.18 });
const bevelMat = new THREE.MeshStandardMaterial({ color: 0x3a3a38, metalness: 0.8, roughness: 0.35 });
