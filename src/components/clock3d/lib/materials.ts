/**
 * Materials palette — Swiss-horology / aerospace monochrome.
 *
 * - Paper-white base.
 * - Titanium, machined aluminum, matte black steel, brushed silver.
 * - One restrained gold accent for PROPOSED state, one cool steel-blue for PREDICTED.
 * - All materials are physically plausible; transmission is used for the small
 *   glass nucleus cap only.
 */
import * as THREE from 'three';

export const PAPER = 0xf3f1ea;
export const INK = 0x111110;
export const LINE = 0xc9c6bc;
export const GOLD = 0xb9975b;
export const STEEL_BLUE = 0x5b7a8c;
export const PREDICTED_TINT = 0x7d97a8;

export const MAT = {
  /** Brushed titanium (calendar, orchestration) */
  ti: new THREE.MeshStandardMaterial({ color: 0xd9d9d6, metalness: 0.92, roughness: 0.32 }),
  /** Machined aluminum (relationships, memory) */
  alu: new THREE.MeshStandardMaterial({ color: 0xededeb, metalness: 0.65, roughness: 0.42 }),
  /** Darker aluminum */
  alu2: new THREE.MeshStandardMaterial({ color: 0xcac9c4, metalness: 0.85, roughness: 0.38 }),
  /** Matte black steel (outer edge, big nodes) */
  black: new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.75, roughness: 0.45 }),
  /** Dark graphite */
  dark: new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.6, roughness: 0.35 }),
  /** Polished silver (small nodes, screw slots) */
  silver: new THREE.MeshStandardMaterial({ color: 0xf2f2f0, metalness: 0.95, roughness: 0.18 }),
  /** Sparse glass accent (small nucleus cage) */
  glass: new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.05,
    transmission: 0.6,
    transparent: true,
    opacity: 0.35
  }),
  /** Brass/gold accent (PROPOSED state) */
  gold: new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.9, roughness: 0.3 })
};

/** State palettes — four visual states of the causal clock. */
export const STATE_META = {
  OBSERVED: { dot: INK, emissive: 0x111111, label: 'OBSERVED' },
  PREDICTED: { dot: PREDICTED_TINT, emissive: 0x101820, label: 'PREDICTED' },
  PROPOSED: { dot: GOLD, emissive: 0x332200, label: 'PROPOSED' },
  CONFIRMED: { dot: 0xffffff, emissive: 0x000000, label: 'CONFIRMED' }
} as const;

export type ClockState = keyof typeof STATE_META;
