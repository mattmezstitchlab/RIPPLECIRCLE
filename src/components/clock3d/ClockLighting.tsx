/**
 * ClockLighting — hemispheric base + directional key + cool rim light.
 * Tuned for monochrome brushed-metal look (ACES tone mapping handled by
 * the Canvas gl prop).
 */
import { useMemo } from 'react';
import * as THREE from 'three';

export function ClockLighting() {
  const shadowCam = useMemo(() => {
    const d = 14;
    const cam = new THREE.OrthographicCamera(-d, d, d, -d, 0.1, 40);
    cam.left = -d; cam.right = d; cam.top = d; cam.bottom = -d;
    cam.near = 0.1; cam.far = 40;
    return cam;
  }, []);

  return (
    <>
      <hemisphereLight args={[0xffffff, 0x8a877e, 1.6]} />
      <directionalLight
        castShadow
        position={[6, 10, 8]}
        intensity={2.2}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera={shadowCam}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-8, 4, -6]} intensity={1.0} color={0xdfe8ee} />
      {/* Ground shadow catcher */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1.6]}>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial opacity={0.09} />
      </mesh>
    </>
  );
}
