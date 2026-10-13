/**
 * Backing — outer aluminum back plate + black bezel + month labels +
 * cross-hair markers. Uses simple, reliable primitive geometry.
 */
import { Text } from '@react-three/drei';
import { MONTHS } from './lib/geometry';

export function Backing() {
  return (
    <group>
      {/* Aluminum support disk (lies behind all rings) */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -0.35]}
      >
        <cylinderGeometry args={[8.18, 8.18, 0.22, 96]} />
        <meshStandardMaterial color={0xd9d9d6} metalness={0.85} roughness={0.38} />
      </mesh>
      {/* Top paper face of the support plate — flat disk with paper color
          so the area inside the outermost ring reads as clean engraved plate */}
      <mesh position={[0, 0, -0.23]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8.05, 96]} />
        <meshStandardMaterial color={0xf3f1ea} metalness={0.0} roughness={1.0} />
      </mesh>
      {/* Black outer bezel */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[8.15, 0.10, 12, 140]} />
        <meshStandardMaterial color={0x141414} metalness={0.75} roughness={0.45} />
      </mesh>
      {/* Subtle inner engraved groove just inside the bezel */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.22]}>
        <torusGeometry args={[7.95, 0.015, 6, 140]} />
        <meshStandardMaterial color={0x888680} metalness={0.7} roughness={0.5} />
      </mesh>
      {/* Month labels */}
      {MONTHS.map((m, i) => {
        const a = Math.PI / 2 - (i / 12) * Math.PI * 2;
        return (
          <Text
            key={m}
            position={[Math.cos(a) * 8.55, Math.sin(a) * 8.55, 0.0]}
            rotation={[0, 0, -a + Math.PI / 2]}
            fontSize={0.32}
            color="#222222"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.02}
          >
            {m}
          </Text>
        );
      })}
      {/* Cross-hair markers */}
      {[
        [0, 9.1],
        [0, -9.1],
        [9.1, 0],
        [-9.1, 0]
      ].map(([x, y], i) => (
        <Text key={i} position={[x, y, 0]} fontSize={0.26} color="#222" anchorX="center" anchorY="middle">✦</Text>
      ))}
    </group>
  );
}
