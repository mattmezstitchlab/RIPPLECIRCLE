/**
 * ClockLighting — bright, even illumination for technical-product look.
 */
import * as THREE from 'three';

export function ClockLighting() {
  const shadowCam = new THREE.OrthographicCamera(-14, 14, 14, -14, 0.1, 40);
  return (
    <>
      {/* Bright ambient base so no face reads as pure black */}
      <ambientLight intensity={0.85} color={0xffffff} />
      <hemisphereLight args={[0xffffff, 0xb8b4a6, 0.9]} />
      <directionalLight
        castShadow
        position={[6, 12, 9]}
        intensity={1.5}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera={shadowCam}
        shadow-bias={-0.0005}
      />
      {/* Fill light from the opposite side to kill harsh shadows */}
      <directionalLight position={[-7, 5, -5]} intensity={0.55} color={0xe8edf2} />
      {/* Soft ground shadow catcher */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2.5]}>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial opacity={0.08} />
      </mesh>
    </>
  );
}
