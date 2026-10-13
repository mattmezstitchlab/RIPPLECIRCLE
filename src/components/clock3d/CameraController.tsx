/**
 * CameraController — wraps drei's OrbitControls to:
 *   - disable plain wheel zoom (same trackpad fix as the 2D Ripple),
 *   - allow Ctrl/Cmd+wheel zoom (the OS-mapped pinch gesture),
 *   - enable smooth bounded zoom via the +/- buttons,
 *   - apply view presets (3/4, front, side, top, exploded) with eased tweening,
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
  const { camera, gl } = useThree();
  const tweenRef = useRef<{ from: THREE.Vector3; to: THREE.Vector3; t: number } | null>(null);

  // Fly to preset when view changes
  useEffect(() => {
    const preset = VIEW_PRESETS[clock.view];
    if (preset) {
      tweenRef.current = {
        from: camera.position.clone(),
        to: new THREE.Vector3(...preset),
        t: 0
      };
      if (controls.current) controls.current.target.set(0, 0, 0);
    }
  }, [clock.view, camera]);

  // Zoom buttons
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ factor: number }>;
      const dir = new THREE.Vector3().subVectors(camera.position, controls.current!.target);
      const dist = dir.length();
      const newDist = THREE.MathUtils.clamp(dist * (ev.detail.factor < 1 ? 0.88 : 1.14), 7, 32);
      dir.setLength(newDist);
      tweenRef.current = {
        from: camera.position.clone(),
        to: controls.current!.target.clone().add(dir),
        t: 0
      };
    };
    window.addEventListener('clock:zoom', handler);
    return () => window.removeEventListener('clock:zoom', handler);
  }, [camera]);

  // Ctrl/Cmd+wheel zoom — same guard as 2D Ripple (never intercept plain scroll).
  useEffect(() => {
    const dom = gl.domElement;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return; // let normal scroll pass
      e.preventDefault();
      const ctrl = controls.current;
      if (!ctrl) return;
      const delta = -e.deltaY / 100; // normalized
      const clamped = THREE.MathUtils.clamp(delta, -0.5, 0.5);
      const dir = new THREE.Vector3().subVectors(camera.position, ctrl.target);
      const dist = dir.length();
      const factor = 1 - clamped * 0.15;
      const newDist = THREE.MathUtils.clamp(dist * factor, 7, 32);
      dir.setLength(newDist);
      camera.position.copy(ctrl.target.clone().add(dir));
      ctrl.update();
    };
    dom.addEventListener('wheel', onWheel, { passive: false });
    return () => dom.removeEventListener('wheel', onWheel);
  }, [camera, gl]);

  useFrame((_, dt) => {
    const ctrl = controls.current;
    if (!ctrl) return;
    if (tweenRef.current) {
      tweenRef.current.t += dt * 1.4;
      const e = 1 - Math.pow(1 - Math.min(tweenRef.current.t, 1), 3);
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
      // Default mouse-wheel zoom disabled — we use Ctrl/Cmd+wheel only.
      enableZoom={false}
      enablePan={false}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI - 0.1}
      minDistance={7}
      maxDistance={32}
      makeDefault
    />
  );
}
