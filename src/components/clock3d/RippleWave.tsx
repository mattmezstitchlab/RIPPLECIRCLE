/**
 * RippleWave — expanding concentric toruses that propagate outward from the
 * nucleus whenever "PROPAGER UNE ONDE" is clicked / mode switches to consequence.
 * Three staggered rings give the impression of a physical wave; they
 * auto-remove after ~1.1 seconds via scale + opacity fade.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  /** Increments each time a wave is fired. */
  triggerKey: number;
}

interface Wave {
  born: number;
  delay: number;
  color: number;
  ref: THREE.Mesh;
}

export function RippleWave({ triggerKey }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const wavesRef = useRef<Wave[]>([]);
  const lastKeyRef = useRef(-1);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    // Spawn new waves when triggerKey changes
    if (lastKeyRef.current !== triggerKey) {
      lastKeyRef.current = triggerKey;
      const colors = [0x111111, 0xb9975b, 0x111111];
      colors.forEach((color, k) => {
        const geo = new THREE.TorusGeometry(1, 0.035, 8, 90);
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.z = 1.1;
        mesh.scale.setScalar(0.01);
        group.add(mesh);
        wavesRef.current.push({ born: performance.now(), delay: k * 280, color, ref: mesh });
      });
    }
    const now = performance.now();
    const alive: Wave[] = [];
    for (const w of wavesRef.current) {
      const t = (now - w.born - w.delay) / 1100;
      if (t < -0.2) { alive.push(w); continue; }
      if (t >= 1.1) {
        group.remove(w.ref);
        w.ref.geometry.dispose();
        (w.ref.material as THREE.Material).dispose();
        continue;
      }
      const tt = Math.max(0, Math.min(1, t));
      w.ref.scale.setScalar(1 + tt * 7.5);
      (w.ref.material as THREE.MeshBasicMaterial).opacity = 0.65 * (1 - tt);
      alive.push(w);
    }
    wavesRef.current = alive;
  });

  return <group ref={groupRef} />;
}
