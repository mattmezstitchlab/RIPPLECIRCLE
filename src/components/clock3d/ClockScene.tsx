/**
 * ClockScene — R3F canvas for the 3D clock.
 */
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Backing } from './Backing';
import { Ring } from './Ring';
import { Nucleus } from './Nucleus';
import { RelationshipWeb } from './RelationshipWeb';
import { RippleWave } from './RippleWave';
import { ClockLighting } from './ClockLighting';
import { CameraController } from './CameraController';
import { BackPlate } from './BackPlate';
import { RING_DEFS, PAPER } from './lib/geometry';
import type { ClockStateApi } from '../../hooks/clock/useClockState';

interface Props { clock: ClockStateApi; }

function Jewel({ clock }: { clock: ClockStateApi }) {
  const pivot = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!pivot.current) return;
    const target = clock.flipped ? Math.PI : 0;
    const cur = pivot.current.rotation.x;
    pivot.current.rotation.x = cur + (target - cur) * Math.min(1, dt * 3.2);
  });
  return (
    <group ref={pivot} onDoubleClick={(e) => { e.stopPropagation(); clock.toggleFlip(); }}>
      <group>
        <Backing />
        {RING_DEFS.map((def, idx) => (
          <Ring key={def.id} def={def} index={idx} baseZ={idx * 0.06} exploded={clock.exploded} clock={clock} />
        ))}
        <RelationshipWeb clock={clock} />
        <Nucleus clock={clock} />
        <RippleWave triggerKey={clock.rippleKey} />
      </group>
      <group rotation={[Math.PI, 0, 0]}>
        <BackPlate clock={clock} />
      </group>
    </group>
  );
}

export function ClockScene({ clock }: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, Math.min(window.devicePixelRatio, 2)]}
      camera={{ position: [0, 6.2, 18.5], fov: 38, near: 0.1, far: 100 }}
      gl={{ antialias: true }}
      style={{ position: 'absolute', inset: 0 }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(PAPER, 1);
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        scene.fog = new THREE.Fog(PAPER, 28, 46);
      }}
      onDoubleClick={() => clock.toggleFlip()}
    >
      <color attach="background" args={[`#${PAPER.toString(16).padStart(6, '0')}`]} />
      <ClockLighting />
      <CameraController clock={clock} />
      <Jewel clock={clock} />
    </Canvas>
  );
}
