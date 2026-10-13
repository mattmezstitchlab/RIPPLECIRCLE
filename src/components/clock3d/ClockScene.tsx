/**
 * ClockScene — the 3D scene of the Clock of Consequences.
 * Contains only Three.js / R3F elements; HTML chrome (dock, inspector)
 * is rendered as a sibling of <Canvas> in Ripple3D.tsx.
 */
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Backing } from './Backing';
import { Ring } from './Ring';
import { Nucleus } from './Nucleus';
import { RelationshipWeb } from './RelationshipWeb';
import { RippleWave } from './RippleWave';
import { ClockLighting } from './ClockLighting';
import { CameraController } from './CameraController';
import { RING_DEFS } from './lib/geometry';
import { PAPER } from './lib/materials';
import type { ClockStateApi } from '../../hooks/clock/useClockState';

interface Props {
  clock: ClockStateApi;
}

export function ClockScene({ clock }: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, Math.min(window.devicePixelRatio, 2)]}
      camera={{ position: [0, 6.2, 18.5], fov: 36, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05
      }}
      style={{ background: 'transparent', position: 'absolute', inset: 0 }}
      onCreated={({ gl, scene }) => {
        scene.background = new THREE.Color(PAPER);
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <fog attach="fog" args={[PAPER, 22, 38]} />
      <ClockLighting />
      <CameraController clock={clock} />

      <group>
        <Backing />
        {RING_DEFS.map((def, idx) => (
          <Ring
            key={def.id}
            def={def}
            index={idx}
            baseZ={idx * 0.06}
            exploded={clock.exploded}
            clock={clock}
          />
        ))}
        <RelationshipWeb clock={clock} />
        <Nucleus clock={clock} />
        <RippleWave triggerKey={clock.rippleKey} />
      </group>
    </Canvas>
  );
}
