/*
 * Scénario d'orchestration : une horloge commune, des scènes qui se propagent
 * d'un rôle à l'autre. Chaque scène a une source (le premier effet) puis des
 * effets en cascade sur les autres rôles.
 */

export type RoleKey = 'maries' | 'temoin' | 'traiteur' | 'photographe' | 'dj' | 'invite' | 'planner';
export type Status = 'ok' | 'late' | 'adjust' | 'wait';

export interface Effect {
  role: RoleKey;
  text: string;
  status?: Status;
  metric?: string;
}

export interface Scene {
  id: string;
  at: string;
  source: RoleKey;
  headline: string;
  effects: Effect[];
  slack?: number;
  stability?: number;
}

/** Couleurs de texte choisies pour un contraste AA sur fond blanc. */
export const STATUS_META: Record<Status, { label: string; dot: string; text: string }> = {
  ok: { label: 'À l’heure', dot: '#30D158', text: '#1E7A39' },
  late: { label: 'En retard', dot: '#FF453A', text: '#C7342B' },
  adjust: { label: 'Ajustement', dot: '#FF9F0A', text: '#9A5B00' },
  wait: { label: 'En attente', dot: '#AEAEB2', text: '#6E6E73' }
};

export const METRIC_LABEL: Record<RoleKey, string> = {
  maries: 'Entrée en salle',
  temoin: 'Discours',
  traiteur: 'Entrées dressées',
  photographe: 'Clichés retenus',
  dj: 'Micros HF',
  invite: 'Votre table',
  planner: 'Marge globale'
};

export interface RoleBase {
  status: Status;
  metric: string;
  text: string;
}

export const BASE: Record<RoleKey, RoleBase> = {
  maries: { status: 'ok', metric: '21:42', text: 'Photos au bord du bassin, tout est calé.' },
  temoin: { status: 'ok', metric: '22:15', text: 'Discours prêt, projection à tester avant le dîner.' },
  traiteur: { status: 'adjust', metric: '60 / 140', text: 'Dressage des entrées en cours en cuisine.' },
  photographe: { status: 'ok', metric: '18', text: 'Séance couple sous la golden hour.' },
  dj: { status: 'ok', metric: '2 / 4', text: 'Lounge en cours, playlist Sunset à 60 %.' },
  invite: { status: 'ok', metric: 'N°7', text: 'Cocktail sur la terrasse, le bar est ouvert.' },
  planner: { status: 'ok', metric: '+24 min', text: 'Toutes les équipes sont synchronisées.' }
};

export const BASE_SLACK = 24;
export const BASE_STABILITY = 96;

export const SCENES: Scene[] = [
  {
    id: 's1',
    at: '21:04',
    source: 'traiteur',
    headline: 'Le traiteur avance le dressage',
    effects: [
      { role: 'traiteur', text: 'Dressage des entrées : 96 assiettes sur 140.', metric: '96 / 140' },
      { role: 'planner', text: 'Suivi du dressage, service visé à 21:42.' }
    ]
  },
  {
    id: 's2',
    at: '21:08',
    source: 'traiteur',
    headline: 'Retard traiteur · +12 min',
    slack: 12,
    stability: 88,
    effects: [
      { role: 'traiteur', text: 'Four N°2 recalibré, le service glisse de 12 min.', status: 'late', metric: '112 / 140' },
      { role: 'planner', text: 'Retard de 12 min détecté, arbitrage en cours.', status: 'adjust', metric: '+12 min' },
      { role: 'dj', text: 'Lounge prolongé de 3 titres pour couvrir l’attente.', status: 'adjust' },
      { role: 'photographe', text: 'Golden hour prolongée de 8 min.', status: 'adjust', metric: '24' },
      { role: 'maries', text: 'Entrée en salle calée à 21:42.', status: 'adjust' },
      { role: 'invite', text: 'Dîner à table à 21:45, le bar reste ouvert.' }
    ]
  },
  {
    id: 's3',
    at: '21:13',
    source: 'planner',
    headline: 'Arbitrage validé · dessert −10 min',
    slack: 22,
    stability: 94,
    effects: [
      { role: 'planner', text: 'Compensation sur le dessert validée (−10 min).', status: 'ok', metric: '+22 min' },
      { role: 'traiteur', text: 'Pièce montée avancée de 10 min, feu vert.', status: 'adjust' },
      { role: 'dj', text: 'Drop de la pièce montée recalé à 23:35.', status: 'ok' },
      { role: 'maries', text: 'Plan confirmé, rien ne change pour vous.', status: 'ok' }
    ]
  },
  {
    id: 's4',
    at: '21:18',
    source: 'maries',
    headline: 'Les mariés sont prêts',
    effects: [
      { role: 'maries', text: 'Retour sur la terrasse, prêts pour l’entrée à 21:42.', status: 'ok' },
      { role: 'dj', text: 'Jingle d’entrée armé, drop à 0:45.' },
      { role: 'photographe', text: 'Position escalier validée pour l’entrée.', status: 'ok', metric: '28' }
    ]
  },
  {
    id: 's5',
    at: '21:23',
    source: 'photographe',
    headline: 'Golden hour capturée',
    effects: [
      { role: 'photographe', text: '32 clichés retenus, cap sur la salle.', status: 'ok', metric: '32' },
      { role: 'maries', text: 'Photos de couple livrées en avant-première.' }
    ]
  },
  {
    id: 's6',
    at: '21:27',
    source: 'planner',
    headline: 'Appel en salle',
    effects: [
      { role: 'planner', text: 'Appel en salle lancé : les invités rejoignent leur table.' },
      { role: 'invite', text: 'Appel en salle : rejoignez la table N°7, côté jardin.' },
      { role: 'temoin', text: 'Placez-vous près de la table d’honneur pour 22:15.' },
      { role: 'traiteur', text: 'Portes de salle ouvertes, dernière vague de dressage.' }
    ]
  },
  {
    id: 's7',
    at: '21:31',
    source: 'temoin',
    headline: 'Projection testée',
    effects: [
      { role: 'temoin', text: 'Signal OK, discours calé à 5 min 40.', metric: '22:15 · 5 min 40' },
      { role: 'dj', text: 'Micros HF 3 et 4 calés pour les discours.', metric: '4 / 4' },
      { role: 'planner', text: 'Ordre des discours confirmé avec le DJ.' }
    ]
  },
  {
    id: 's8',
    at: '21:36',
    source: 'dj',
    headline: 'Son et lumière prêts',
    effects: [
      { role: 'dj', text: 'Lumières dorées programmées pour 21:42.', status: 'ok' },
      { role: 'maries', text: 'En position derrière la porte, jingle prêt.' },
      { role: 'photographe', text: 'Deux positions prêtes : escalier et face piste.' }
    ]
  },
  {
    id: 's9',
    at: '21:42',
    source: 'traiteur',
    headline: 'Entrée en salle · service lancé',
    slack: 24,
    stability: 98,
    effects: [
      { role: 'traiteur', text: 'Service des entrées lancé, 140 assiettes par vagues.', status: 'ok', metric: '140 / 140' },
      { role: 'maries', text: 'Entrée en salle ! Applaudissements sur le jingle.', status: 'ok' },
      { role: 'dj', text: 'Jingle lancé, faisceaux dorés allumés.' },
      { role: 'photographe', text: 'Entrée des mariés capturée sous deux angles.', metric: '36' },
      { role: 'invite', text: 'Les entrées sont servies, bon appétit.' },
      { role: 'planner', text: 'Retard résorbé, marge entièrement reconstituée.', status: 'ok', metric: '+24 min' }
    ]
  },
  {
    id: 's10',
    at: '21:50',
    source: 'invite',
    headline: 'Toutes les tables sont servies',
    effects: [
      { role: 'invite', text: 'Table N°7 au complet, les entrées sont servies.' },
      { role: 'planner', text: 'Plan de salle validé, 94 convives à table.' },
      { role: 'temoin', text: 'Premier discours dans 25 min, micro 1 prêt.' }
    ]
  }
];
