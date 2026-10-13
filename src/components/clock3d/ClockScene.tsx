/**
 * ClockScene — the 3D scene of the Clock of Consequences.
 *
 * The entire mechanism (front + back) lives inside a "jewel" group that can
 * rotate 180° around the X axis when the user flips the instrument
 * (double-click anywhere or the F/R pusher / crown button).
 *
 * The jewel is centered on the screen at a comfortable 3/4 perspective,
 * floating over the paper background with no bounding frame — a pure
 * objet rather than a page element.
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
import { RING_DEFS } from './lib/geometry';
import { PAPER } from './lib/materials';
import type { ClockStateApi } from '../../hooks/clock/useClockState';

interface Props {
  clock: ClockStateApi;
}

function Jewel({ clock }: { clock: ClockStateApi }) {
  const pivot = useRef<THREE.Group>(null);
  const targetRot = useRef(clock.flipped ? Math.PI : 0);

  // Any click outside a node (on empty space) arms a double-click detector
  // to flip the jewel. The onDoubleClick handler on the Canvas uses this.

  useFrame((_, dt) => {
    if (!pivot.current) return;
    // Smoothly interpolate rotation to target (easeOutCubic per frame)
    targetRot.current = clock.flipped ? Math.PI : 0;
    const current = pivot.current.rotation.x;
    const diff = targetRot.current - current;
    pivot.current.rotation.x = current + diff * Math.min(1, dt * 3.2);
  });

  return (
    <group
      ref={pivot}
      onDoubleClick={(e) => {
        e.stopPropagation();
        clock.toggleFlip();
      }}
    >
      {/* Front face — rings + nucleus */}
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
      {/* Back face — mechanical plate (rotated 180° so it faces -Z; the pivot
          rotation flips the whole jewel to show this side). */}
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
      camera={{ position: [0, 6.2, 18.5], fov: 36, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.08
      }}
      style={{ background: 'transparent', position: 'absolute', inset: 0, cursor: 'grab' }}
      onCreated={({ gl, scene }) => {
        scene.background = new THREE.Color(PAPER);
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
      onDoubleClick={() => clock.toggleFlip()}
    >
      <fog attach="fog" args={[PAPER, 24, 42]} />
      <ClockLighting />
      <CameraController clock={clock} />
      <Jewel clock={clock} />
    </Canvas>
  );
}
