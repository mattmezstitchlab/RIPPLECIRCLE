/**
 * entityInfo — resolves a selected entity id to a human-facing descriptor
 * for the inspector panel. Phase D will wire this to real data (people,
 * moments, tracks, etc.) by cross-referencing the existing schema/core.ts
 * models; for Phase B we keep the structure stable so the UI doesn't change
 * when real data arrives.
 */
import { RING_DEFS } from './geometry';

export interface EntityInfo {
  name: string;
  ringId: string;
  ringName: string;
  description: string;
  connectionCount: number;
}

const CORE_INFO: EntityInfo = {
  name: 'Noyau Identitaire',
  ringId: 'CORE',
  ringName: 'NUCLEUS',
  description:
    "Ancre les valeurs, la vision et la cohérence globale. Point d'origine de chaque propagation.",
  connectionCount: 6
};

export function getEntityInfo(id: string): EntityInfo {
  if (id === 'CORE-001') return CORE_INFO;
  const ringId = id.split('-')[0];
  const def = RING_DEFS.find((r) => r.id === ringId);
  if (!def) return { name: id, ringId: '?', ringName: 'UNKNOWN', description: '', connectionCount: 0 };
  // Stable pseudo-random connection count derived from id characters
  const code = id.charCodeAt(id.length - 1) + id.charCodeAt(4);
  const connCount = 3 + (code % 6);
  return {
    name: `${def.name} ${id.split('-')[1]}`,
    ringId: def.id,
    ringName: def.name.toUpperCase(),
    description:
      def.id === 'PEOPLE'
        ? 'Personne reliée au système. Ses actions, disponibilités et relations modifient les anneaux adjacents.'
        : def.id === 'MOM'
          ? "Segment d'activité — horaire, lieu, durée et responsable. Les retards se propagent aux moments dépendants."
          : def.id === 'ORCH'
            ? 'Mécanisme de propagation — exprime dépendances, responsabilités et conséquences.'
            : 'Élément mécanique réel — ID stable, anneau indépendant, dépendances visibles et réversibles.',
    connectionCount: connCount
  };
}
