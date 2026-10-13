/**
 * CameraController — wraps drei's OrbitControls to:
 *   - disable plain wheel zoom (same trackpad fix as the 2D Ripple),
 *   - enable smooth bounded zoom via dolly,
 *   - apply view presets (3/4, front, side, top, exploded) with eased tweening,
 *   - support custom zoom buttons via a window event ('clock:zoom').
 *
 * The camera never scales geometry — transforms are strictly on the camera.
 */
import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { VIEW_PRESETS } from './lib/geometry';
import type { ClockStateApi } from '../../hooks/clock/useClockState';

interface Props {
  clock: ClockStateApi;
}

export function CameraController({ clock }: Props) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const tweenRef = useRef<{ from: THREE.Vector3; to: THREE.Vector3; t: number } | null>(null);

  // When view changes, fly to preset
  useEffect(() => {
    const preset = VIEW_PRESETS[clock.view];
    if (preset) {
      tweenRef.current = {
        from: camera.position.clone(),
        to: new THREE.Vector3(...preset),
        t: 0
      };
    }
  }, [clock.view, camera]);

  // Zoom buttons
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ factor: number }>;
      const f = ev.detail.factor;
      const dir = new THREE.Vector3().subVectors(camera.position, controls.current!.target);
      dir.multiplyScalar(f < 1 ? 0.88 : 1.14);
      const target = controls.current!.target.clone().add(dir);
      tweenRef.current = { from: camera.position.clone(), to: target, t: 0 };
    };
    window.addEventListener('clock:zoom', handler);
    return () => window.removeEventListener('clock:zoom', handler);
  }, [camera]);

  useFrame((_, dt) => {
    const ctrl = controls.current;
    if (!ctrl) return;
    if (tweenRef.current) {
      tweenRef.current.t += dt * 1.2;
      const e = 1 - Math.pow(1 - Math.min(tweenRef.current.t, 1), 3); // easeOutCubic
      camera.position.lerpVectors(tweenRef.current.from, tweenRef.current.to, e);
      if (tweenRef.current.t >= 1) tweenRef.current = null;
    }
    ctrl.update();
  });

  return (
    <OrbitControls
      ref={controls}
      enableDamping
      dampingFactor={0.06}
      // CRITICAL: disable default mouse-wheel zoom (prevents runaway zoom on
      // normal trackpad scroll — same guard as the 2D Ripple). Users zoom via
      // the +/− buttons. Orbit still works with right-mouse drag / touch.
      enableZoom={false}
      enablePan={false}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI - 0.15}
      makeDefault
    />
  );
}
