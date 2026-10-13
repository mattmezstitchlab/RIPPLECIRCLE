/**
 * Geometry helpers for the Clock of Consequences.
 *
 * NOTE: We previously used THREE.ExtrudeGeometry for annuli, which produced
 * unreliable top-cap normals under certain rotations/lights. We now build
 * every ring body as a THREE.RingGeometry (flat annular disk) with a torus
 * side wall — rock-solid top/side faces with correct normals.
 */
export interface RingDef {
  id: string;
  name: string;
  label: string;
  radius: number;
  width: number;
  depth: number;
  materialKey: 'ti' | 'alu' | 'alu2';
  idleSpeed: number;
  nodeCount: number;
  nodeRadius: number;
  tickCount: number;
}

export const RING_DEFS: RingDef[] = [
  { id: 'CAL', name: 'Calendar', label: 'Anneau calendaire', radius: 7.45, width: 0.95, depth: 0.28, materialKey: 'alu', idleSpeed: 0.018, nodeCount: 12, nodeRadius: 0.14, tickCount: 72 },
  { id: 'TIME', name: 'Time', label: 'Anneau du temps', radius: 6.45, width: 0.72, depth: 0.36, materialKey: 'ti', idleSpeed: -0.035, nodeCount: 16, nodeRadius: 0.11, tickCount: 48 },
  { id: 'PEOPLE', name: 'People', label: 'Couronne des relations', radius: 5.55, width: 0.62, depth: 0.44, materialKey: 'alu2', idleSpeed: 0.055, nodeCount: 14, nodeRadius: 0.24, tickCount: 48 },
  { id: 'REL', name: 'Relationships', label: 'Relations', radius: 4.65, width: 0.50, depth: 0.32, materialKey: 'alu', idleSpeed: -0.07, nodeCount: 20, nodeRadius: 0.09, tickCount: 48 },
  { id: 'MOM', name: 'Moments', label: 'Moments', radius: 3.85, width: 0.50, depth: 0.40, materialKey: 'ti', idleSpeed: 0.09, nodeCount: 18, nodeRadius: 0.16, tickCount: 48 },
  { id: 'ORCH', name: 'Orchestration', label: 'Orchestration adaptative', radius: 3.00, width: 0.44, depth: 0.30, materialKey: 'alu2', idleSpeed: -0.11, nodeCount: 24, nodeRadius: 0.07, tickCount: 48 },
  { id: 'MEM', name: 'Memory', label: 'Mémoire active', radius: 2.25, width: 0.42, depth: 0.36, materialKey: 'alu', idleSpeed: 0.13, nodeCount: 16, nodeRadius: 0.10, tickCount: 48 }
];

export const MONTHS = ['JANV.', 'FÉVR.', 'MARS', 'AVR.', 'MAI', 'JUIN', 'JUIL.', 'AOÛT', 'SEPT.', 'OCT.', 'NOV.', 'DÉC.'];

export const DEFAULT_PEOPLE_NAMES = [
  'M. Laurent', 'A. Chen', 'S. Moreau', 'J. Novak', 'L. Petit', 'N. Haddad',
  'E. Rossi', 'K. Tanaka', 'C. Dubois', 'R. Silva', 'I. Meyer', 'T. Okafor',
  'H. Lindqvist', 'P. Martin'
];

export const VIEW_PRESETS: Record<string, [number, number, number]> = {
  '3/4': [0, 6.2, 18.5],
  front: [0, 0.1, 19],
  side: [19, 0.6, 0.8],
  top: [0.01, 19, 0.01],
  exploded: [9, 7, 15]
};

export const PAPER = 0xf3f1ea;
