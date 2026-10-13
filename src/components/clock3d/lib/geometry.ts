/**
 * Ring geometry helpers for the Clock of Consequences.
 *
 * Each ring is an extruded annulus (flat torus-like disk) with beveled edges
 * for a machined look, plus inner/outer torus rails, ticks, and node mounts.
 * Geometry is generated procedurally so we can reuse it for any data.
 */
import * as THREE from 'three';

/** Builds an extruded annulus (flat disk with a hole) used as the ring body. */
export function makeAnnulusGeometry(radius: number, width: number, depth: number): THREE.ExtrudeGeometry {
  // ExtrudeGeometry extrudes from the XY plane along +Z by default — that is
  // exactly the direction facing our 3/4 camera, so the top face of each ring
  // is visible. We build the outer arc clockwise (Three default is CCW = front
  // face) and the hole counter-clockwise (CCW = the hole faces the SAME way
  // as the outer so it becomes a real cut-out, not a flipped cap).
  const shape = new THREE.Shape();
  shape.absarc(0, 0, radius + width / 2, 0, Math.PI * 2, false); // CCW outer
  const hole = new THREE.Path();
  hole.absarc(0, 0, radius - width / 2, 0, Math.PI * 2, true); // CW hole
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
    curveSegments: 96
  });
  geo.translate(0, 0, -depth / 2); // center on z = 0 so both sides extend equally
  geo.computeVertexNormals();
  return geo;
}

/** Descriptor for one concentric ring of the clock. */
export interface RingDef {
  id: string;
  name: string;
  /** French label shown on hover and in side panels. */
  label: string;
  /** Mean radius from center. */
  radius: number;
  /** Radial width (thickness) of the ring band. */
  width: number;
  /** Depth (Z extrusion) for 3D thickness. */
  depth: number;
  /** Which material key from MAT. */
  materialKey: 'ti' | 'alu' | 'alu2';
  /** Idle rotation speed (radians per second, signed for direction). */
  idleSpeed: number;
  /** Number of mechanical nodes mounted on this ring. */
  nodeCount: number;
  /** Base radius for spherical nodes. */
  nodeRadius: number;
  /** Number of engraved ticks around the ring. */
  tickCount: number;
}

export const RING_DEFS: RingDef[] = [
  { id: 'CAL', name: 'Calendar', label: 'Anneau calendaire', radius: 7.45, width: 0.95, depth: 0.34, materialKey: 'alu', idleSpeed: 0.018, nodeCount: 12, nodeRadius: 0.14, tickCount: 72 },
  { id: 'TIME', name: 'Time', label: 'Anneau du temps', radius: 6.45, width: 0.72, depth: 0.48, materialKey: 'ti', idleSpeed: -0.035, nodeCount: 16, nodeRadius: 0.11, tickCount: 48 },
  { id: 'PEOPLE', name: 'People', label: 'Couronne des relations', radius: 5.55, width: 0.62, depth: 0.62, materialKey: 'alu2', idleSpeed: 0.055, nodeCount: 14, nodeRadius: 0.24, tickCount: 48 },
  { id: 'REL', name: 'Relationships', label: 'Relations', radius: 4.65, width: 0.5, depth: 0.42, materialKey: 'alu', idleSpeed: -0.07, nodeCount: 20, nodeRadius: 0.09, tickCount: 48 },
  { id: 'MOM', name: 'Moments', label: 'Moments', radius: 3.85, width: 0.5, depth: 0.55, materialKey: 'ti', idleSpeed: 0.09, nodeCount: 18, nodeRadius: 0.16, tickCount: 48 },
  { id: 'ORCH', name: 'Orchestration', label: 'Orchestration adaptative', radius: 3.0, width: 0.44, depth: 0.38, materialKey: 'alu2', idleSpeed: -0.11, nodeCount: 24, nodeRadius: 0.07, tickCount: 48 },
  { id: 'MEM', name: 'Memory', label: 'Mémoire active', radius: 2.25, width: 0.42, depth: 0.5, materialKey: 'alu', idleSpeed: 0.13, nodeCount: 16, nodeRadius: 0.10, tickCount: 48 }
];

export const MONTHS = ['JANV.', 'FÉVR.', 'MARS', 'AVR.', 'MAI', 'JUIN', 'JUIL.', 'AOÛT', 'SEPT.', 'OCT.', 'NOV.', 'DÉC.'];

/** Default people labels used when no real data node is mounted yet — replaced by data. */
export const DEFAULT_PEOPLE_NAMES = [
  'M. Laurent', 'A. Chen', 'S. Moreau', 'J. Novak', 'L. Petit', 'N. Haddad',
  'E. Rossi', 'K. Tanaka', 'C. Dubois', 'R. Silva', 'I. Meyer', 'T. Okafor',
  'H. Lindqvist', 'P. Martin'
];

/** Camera preset positions (x, y, z). */
export const VIEW_PRESETS: Record<string, [number, number, number]> = {
  '3/4': [0, 6.2, 18.5],
  front: [0, 0, 19],
  side: [19, 0.6, 0.8],
  top: [0, 19, 0.4],
  exploded: [9, 7, 15]
};
