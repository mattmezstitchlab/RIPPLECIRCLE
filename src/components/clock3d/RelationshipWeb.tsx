/**
 * RelationshipWeb — thin lines connecting nodes across rings.
 * In connection / consequence mode the web turns gold and becomes more opaque;
 * in instrument mode it is subtle (near-black, low opacity).
 * This is a placeholder wiring that samples one node every few indices and
 * links to another ring; real relationships will be wired from data/networking
 * in Phase D without changing this component's API.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { GOLD, INK } from './lib/materials';
import type { ClockStateApi } from '../../hooks/clock/useClockState';

interface Props {
  clock: ClockStateApi;
}

const TOTAL_NODES = 7 * 14;

export function RelationshipWeb({ clock }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const radii = [7.45, 6.45, 5.55, 4.65, 3.85, 3.0, 2.25];
    const out: [number, number, number][][] = [];
    let seed = 1337;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let k = 0; k < 32; k++) {
      const i1 = Math.floor(rnd() * radii.length);
      let i2 = Math.floor(rnd() * radii.length);
      if (i2 === i1) i2 = (i2 + 1) % radii.length;
      const r1 = radii[i1];
      const r2 = radii[i2];
      const a1 = rnd() * Math.PI * 2;
      const a2 = a1 + (rnd() - 0.5) * 1.6;
      out.push([
        [Math.cos(a1) * r1, Math.sin(a1) * r1, 0],
        [Math.cos(a2) * r2, Math.sin(a2) * r2, 0]
      ]);
    }
    void TOTAL_NODES;
    return out;
  }, []);

  useFrame((_, dt) => {
    const g = groupRef.current;
    if (!g) return;
    if (clock.playing) g.rotation.z += dt * 0.02;
    const targetZ = 0.95 + clock.exploded * 1.4;
    g.position.z += (targetZ - g.position.z) * 0.12;
  });

  const connectionMode = clock.mode === 'connection' || clock.mode === 'consequence';
  const color = connectionMode ? GOLD : INK;
  const opacity = connectionMode ? 0.75 : 0.22;

  return (
    <group ref={groupRef} position={[0, 0, 0.95]}>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color={color} lineWidth={1} transparent opacity={opacity} />
      ))}
    </group>
  );
}
