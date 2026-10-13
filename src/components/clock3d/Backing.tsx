/**
 * Backing plate + outer edge + month text labels around the clock.
 * Text labels use drei's <Text> for crisp SVG-based rendering in 3D space.
 */
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { MONTHS } from './lib/geometry';
import { MAT } from './lib/materials';

export function Backing() {
  return (
    <group>
      {/* Matte aluminum back plate */}
      <mesh receiveShadow castShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.55]}>
        <cylinderGeometry args={[8.15, 8.15, 0.22, 96]} />
        <meshStandardMaterial color={0xd9d9d6} metalness={0.85} roughness={0.38} />
      </mesh>
      {/* Black outer bezel */}
      <mesh castShadow geometry={new THREE.TorusGeometry(8.15, 0.09, 12, 140)} material={MAT.black} />
      {/* Month labels — engrave-style black text on black background? Use INK on paper tone. */}
      {MONTHS.map((m, i) => {
        const a = Math.PI / 2 - (i / 12) * Math.PI * 2; // Janv at top
        return (
          <Text
            key={m}
            position={[Math.cos(a) * 8.85, Math.sin(a) * 8.85, 0.2]}
            rotation={[0, 0, -a + Math.PI / 2]}
            fontSize={0.36}
            color="#222222"
            anchorX="center"
            anchorY="middle"
            font={undefined}
            letterSpacing={0.02}
          >
            {m}
          </Text>
        );
      })}
      {/* Cross-hair markers at N/S/E/W */}
      {[
        [0, 9.5],
        [0, -9.5],
        [9.5, 0],
        [-9.5, 0]
      ].map(([x, y], i) => (
        <Text key={i} position={[x, y, 0]} fontSize={0.28} color="#222" anchorX="center" anchorY="middle">✦</Text>
      ))}
    </group>
  );
}
