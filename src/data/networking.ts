/*
 * Plan de tables « apporteur d'affaires ».
 * Chaque invité a un métier, un secteur et des centres d'intérêt.
 * Le placement maximise les opportunités entre métiers complémentaires et
 * les intérêts partagés. Les couples sont volontairement séparés : chacun
 * devient un pont vers une autre table.
 */

import { INITIAL_STAKEHOLDERS } from './weddingData';

export type Interest = 'tech' | 'art' | 'gastro' | 'sport' | 'voyage' | 'finance' | 'musique' | 'nature';

export const INTERESTS: { id: Interest; label: string; color: string }[] = [
  { id: 'tech', label: 'Tech', color: '#0A84FF' },
  { id: 'finance', label: 'Finance', color: '#30D158' },
  { id: 'art', label: 'Art & design', color: '#BF5AF2' },
  { id: 'gastro', label: 'Gastronomie', color: '#FF9F0A' },
  { id: 'voyage', label: 'Voyage', color: '#64D2FF' },
  { id: 'sport', label: 'Sport', color: '#FF453A' },
  { id: 'musique', label: 'Musique', color: '#FF375F' },
  { id: 'nature', label: 'Nature', color: '#34C759' }
];

export const INTEREST_BY_ID = Object.fromEntries(INTERESTS.map((i) => [i.id, i])) as Record<
  Interest,
  (typeof INTERESTS)[number]
>;

export type Sector =
  | 'startup'
  | 'investissement'
  | 'juridique'
  | 'immobilier'
  | 'architecture'
  | 'marketing'
  | 'restauration'
  | 'sante'
  | 'industrie'
  | 'creation'
  | 'conseil'
  | 'evenementiel';

/** Paires de secteurs qui se rendent service : qui peut apporter quoi à qui. */
export const SYNERGIES: { a: Sector; b: Sector; why: string }[] = [
  { a: 'startup', b: 'investissement', why: 'Levée de fonds' },
  { a: 'startup', b: 'juridique', why: 'Statuts & pacte d’associés' },
  { a: 'startup', b: 'marketing', why: 'Lancement produit' },
  { a: 'immobilier', b: 'architecture', why: 'Projet de rénovation' },
  { a: 'immobilier', b: 'investissement', why: 'Investissement locatif' },
  { a: 'immobilier', b: 'juridique', why: 'Acte & montage SCI' },
  { a: 'restauration', b: 'marketing', why: 'Visibilité & clientèle' },
  { a: 'restauration', b: 'evenementiel', why: 'Traiteur pour événements' },
  { a: 'restauration', b: 'architecture', why: 'Aménagement de salle' },
  { a: 'sante', b: 'startup', why: 'Healthtech' },
  { a: 'sante', b: 'investissement', why: 'Ouverture de cabinet' },
  { a: 'industrie', b: 'conseil', why: 'Transformation' },
  { a: 'industrie', b: 'startup', why: 'Innovation ouverte' },
  { a: 'creation', b: 'marketing', why: 'Direction artistique' },
  { a: 'creation', b: 'evenementiel', why: 'Scénographie' },
  { a: 'conseil', b: 'investissement', why: 'Due diligence' },
  { a: 'evenementiel', b: 'marketing', why: 'Activation de marque' },
  { a: 'architecture', b: 'creation', why: 'Design d’intérieur' }
];

export interface NetGuest {
  id: string;
  first: string;
  last: string;
  job: string;
  company: string;
  /** Secteur d'activité (absent pour les mariés et les témoins). */
  sector?: Sector;
  interests: Interest[];
  /** Identifiant du conjoint / de la conjointe, si couple. */
  partner?: string;
  /** Ce que la personne cherche en ce moment. */
  seeking: string;
  /** « team » : mariés, témoins et prestataires (hors plan de tables). */
  kind?: 'guest' | 'team';
  /** Photo de profil, si différente du portrait par défaut. */
  photo?: string;
  /** Dossier documentaire associé (clé de DOCS). */
  roleId?: string;
  /** Fiche de contact associée (INITIAL_STAKEHOLDERS). */
  stakeholderId?: string;
}

const g = (
  id: string,
  first: string,
  last: string,
  job: string,
  company: string,
  sector: Sector,
  interests: Interest[],
  seeking: string,
  partner?: string
): NetGuest => ({ id, first, last, job, company, sector, interests, seeking, partner });

export const NET_GUESTS: NetGuest[] = [
  g('n1', 'Antoine', 'Moreau', 'Fondateur', 'Kelvin (SaaS énergie)', 'startup', ['tech', 'sport', 'voyage'], 'Lever 2 M€ en seed', 'n2'),
  g('n2', 'Camille', 'Moreau', 'Avocate d’affaires', 'Cabinet Lys', 'juridique', ['art', 'voyage', 'gastro'], 'Nouveaux clients startups', 'n1'),
  g('n3', 'Hugo', 'Bernard', 'Business angel', 'Bernard Capital', 'investissement', ['finance', 'tech', 'sport'], 'Dossiers deeptech', 'n4'),
  g('n4', 'Léa', 'Bernard', 'Architecte DPLG', 'Atelier Ombre', 'architecture', ['art', 'nature', 'voyage'], 'Projets de rénovation', 'n3'),
  g('n5', 'Théo', 'Petit', 'Agent immobilier', 'Petit & Fils', 'immobilier', ['finance', 'sport', 'gastro'], 'Investisseurs locatifs', 'n6'),
  g('n6', 'Manon', 'Petit', 'Directrice marketing', 'Maison Oléa', 'marketing', ['art', 'musique', 'voyage'], 'Partenaires événementiels', 'n5'),
  g('n7', 'Nathan', 'Durand', 'Chef cuisinier', 'Le Comptoir Durand', 'restauration', ['gastro', 'nature', 'musique'], 'Ouvrir un 2ᵉ restaurant', 'n8'),
  g('n8', 'Chloé', 'Durand', 'Médecin généraliste', 'Cabinet Gambetta', 'sante', ['sport', 'nature', 'voyage'], 'Associé·e pour un cabinet', 'n7'),
  g('n9', 'Louis', 'Lefèvre', 'Directeur d’usine', 'Lefèvre Métal', 'industrie', ['tech', 'sport', 'finance'], 'Automatiser la production', 'n10'),
  g('n10', 'Inès', 'Lefèvre', 'Designer graphique', 'Studio Inès', 'creation', ['art', 'musique', 'tech'], 'Marques à identité forte', 'n9'),
  g('n11', 'Raphaël', 'Roux', 'Consultant stratégie', 'Roux Partners', 'conseil', ['finance', 'voyage', 'tech'], 'Missions industrie', 'n12'),
  g('n12', 'Jade', 'Roux', 'Organisatrice d’événements', 'Fête & Cie', 'evenementiel', ['musique', 'gastro', 'art'], 'Lieux & traiteurs', 'n11'),
  g('n13', 'Gabriel', 'Girard', 'CTO', 'Medilink', 'startup', ['tech', 'sport', 'musique'], 'Partenaires cliniques', 'n14'),
  g('n14', 'Zoé', 'Girard', 'Notaire', 'Étude Girard', 'juridique', ['finance', 'nature', 'gastro'], 'Montages SCI', 'n13'),
  g('n15', 'Arthur', 'Fontaine', 'Gérant de fonds', 'Fontaine AM', 'investissement', ['finance', 'voyage', 'gastro'], 'Actifs immobiliers', 'n16'),
  g('n16', 'Emma', 'Fontaine', 'Photographe', 'Studio Lumen', 'creation', ['art', 'voyage', 'nature'], 'Campagnes de marque', 'n15'),
  g('n17', 'Maël', 'Mercier', 'Promoteur', 'Mercier Habitat', 'immobilier', ['finance', 'nature', 'sport'], 'Architectes & banques', 'n18'),
  g('n18', 'Alice', 'Mercier', 'Kinésithérapeute', 'Kiné Mercier', 'sante', ['sport', 'musique', 'nature'], 'Local professionnel', 'n17'),
  g('n19', 'Tom', 'Lambert', 'Growth marketer', 'Scale Lab', 'marketing', ['tech', 'musique', 'sport'], 'Startups en lancement', 'n20'),
  g('n20', 'Sarah', 'Lambert', 'Restauratrice', 'Bistrot Lambert', 'restauration', ['gastro', 'voyage', 'art'], 'Privatisations & mariages', 'n19'),
  g('n21', 'Paul', 'Blanc', 'Ingénieur R&D', 'Aéro Blanc', 'industrie', ['tech', 'nature', 'voyage'], 'Startups partenaires', 'n22'),
  g('n22', 'Juliette', 'Blanc', 'Consultante RSE', 'Verde Conseil', 'conseil', ['nature', 'voyage', 'art'], 'Industriels en transition', 'n21'),
  g('n23', 'Adam', 'Garnier', 'Scénographe', 'Garnier Scènes', 'creation', ['art', 'musique', 'gastro'], 'Événements d’envergure', 'n24'),
  g('n24', 'Lola', 'Garnier', 'Directrice de lieu', 'Château des Lys', 'evenementiel', ['gastro', 'nature', 'musique'], 'Traiteurs & scénographes', 'n23'),
  g('n25', 'Victor', 'Faure', 'Fondateur', 'Fourchette Verte (foodtech)', 'startup', ['gastro', 'tech', 'nature'], 'Restaurants pilotes'),
  g('n26', 'Clara', 'Chevalier', 'Banquière privée', 'Banque Chevalier', 'investissement', ['finance', 'art', 'voyage'], 'Entrepreneurs à accompagner'),
  g('n27', 'Hélène', 'Roy', 'Architecte d’intérieur', 'Roy Design', 'architecture', ['art', 'gastro', 'voyage'], 'Restaurants à aménager'),
  g('n28', 'Simon', 'Leroy', 'Avocat fiscaliste', 'Leroy Avocats', 'juridique', ['finance', 'sport', 'tech'], 'Dirigeants & investisseurs'),
  g('n29', 'Nina', 'Colin', 'Pharmacienne', 'Pharmacie Colin', 'sante', ['nature', 'art', 'voyage'], 'Investir dans un 2ᵉ officine'),
  g('n30', 'Yanis', 'Vidal', 'DJ & producteur', 'Vidal Sound', 'evenementiel', ['musique', 'tech', 'sport'], 'Lieux & organisateurs'),
  g('n31', 'Marie', 'Perrin', 'Directrice industrielle', 'Perrin Textile', 'industrie', ['art', 'finance', 'nature'], 'Designers & marketing'),
  g('n32', 'Lucas', 'Henry', 'Consultant M&A', 'Henry Advisory', 'conseil', ['finance', 'sport', 'voyage'], 'Fonds & cibles')
];

const avatarOf = (stakeholderId: string) => INITIAL_STAKEHOLDERS.find((s) => s.id === stakeholderId)?.avatarUrl;

/** L'équipe de la soirée : mariés, témoins et prestataires, présents dans le graphe. */
export const NET_TEAM: NetGuest[] = [
  {
    id: 't-maries',
    first: 'Alexandre',
    last: '& Sophie',
    job: 'Les mariés',
    company: 'Hôtes de la soirée',
    interests: ['voyage', 'gastro', 'musique'],
    seeking: 'Que chacun reparte avec une belle rencontre',
    kind: 'team',
    roleId: 'maries',
    stakeholderId: 'maries',
    photo: avatarOf('maries')
  },
  {
    id: 't-temoins',
    first: 'Clara',
    last: '& Julien',
    job: 'Témoins',
    company: 'Discours & animations',
    interests: ['musique', 'art', 'sport'],
    seeking: 'Des anecdotes sur les mariés pour le discours',
    kind: 'team',
    roleId: 'temoin',
    stakeholderId: 'caj',
    photo: avatarOf('caj')
  },
  {
    id: 't-traiteur',
    first: 'Mathilde',
    last: 'Gauthier',
    job: 'Cheffe traiteur',
    company: 'Maison Gauthier',
    sector: 'restauration',
    interests: ['gastro', 'nature', 'voyage'],
    seeking: 'Des lieux de réception partenaires',
    kind: 'team',
    roleId: 'traiteur',
    stakeholderId: 'traiteur-left',
    photo: avatarOf('traiteur-left')
  },
  {
    id: 't-photo',
    first: 'Lucas',
    last: 'Vasseur',
    job: 'Photographe & vidéaste',
    company: 'Lucas V. Photography',
    sector: 'creation',
    interests: ['art', 'voyage', 'nature'],
    seeking: 'Des marques pour des campagnes photo',
    kind: 'team',
    roleId: 'photographe',
    stakeholderId: 'photographe',
    photo: avatarOf('photographe')
  },
  {
    id: 't-dj',
    first: 'Marc',
    last: 'Delorme',
    job: 'DJ & régie son',
    company: 'Pulse Live Sound',
    sector: 'evenementiel',
    interests: ['musique', 'tech', 'sport'],
    seeking: 'Des soirées d’entreprise à animer',
    kind: 'team',
    roleId: 'dj',
    stakeholderId: 'dj',
    photo: avatarOf('dj')
  },
  {
    id: 't-planner',
    first: 'Éléonore',
    last: 'Martin',
    job: 'Wedding planner',
    company: 'Agence Étoile Dorée',
    sector: 'evenementiel',
    interests: ['art', 'voyage', 'gastro'],
    seeking: 'Des domaines et prestataires pour 2027',
    kind: 'team',
    roleId: 'planner',
    stakeholderId: 'wedding-planner',
    photo: avatarOf('wedding-planner')
  }
];

export const ALL_PEOPLE: NetGuest[] = [...NET_GUESTS, ...NET_TEAM];

export const NET_BY_ID = Object.fromEntries(ALL_PEOPLE.map((x) => [x.id, x])) as Record<string, NetGuest>;

export const SECTOR_LABEL: Record<Sector, string> = {
  startup: 'Startup',
  investissement: 'Investissement',
  juridique: 'Juridique',
  immobilier: 'Immobilier',
  architecture: 'Architecture',
  marketing: 'Marketing',
  restauration: 'Restauration',
  sante: 'Santé',
  industrie: 'Industrie',
  creation: 'Création',
  conseil: 'Conseil',
  evenementiel: 'Événementiel'
};

/** Raison d'affaires entre deux invités, si leurs secteurs sont complémentaires. */
export function synergyOf(x: NetGuest, y: NetGuest): string | null {
  if (!x.sector || !y.sector) return null;
  const s = SYNERGIES.find((k) => (k.a === x.sector && k.b === y.sector) || (k.a === y.sector && k.b === x.sector));
  return s ? s.why : null;
}

export function sharedInterests(x: NetGuest, y: NetGuest): Interest[] {
  return x.interests.filter((i) => y.interests.includes(i));
}

/** Score d'affinité : les affaires d'abord, les intérêts ensuite, la redondance pénalisée. */
export function pairScore(x: NetGuest, y: NetGuest): number {
  let s = 0;
  if (synergyOf(x, y)) s += 10;
  s += sharedInterests(x, y).length * 3;
  if (x.sector && x.sector === y.sector) s -= 6;
  // Le plan sépare les couples : un couple à la même table est fortement pénalisé.
  if (x.partner === y.id) s -= 100;
  return s;
}

export interface NetTable {
  id: string;
  name: string;
  theme: string;
  guests: string[];
}

const TABLE_NAMES = [
  { name: 'Table Lancement', theme: 'Startups, juridique & croissance' },
  { name: 'Table Pierre', theme: 'Immobilier, architecture & capital' },
  { name: 'Table Saveurs', theme: 'Restauration, lieux & marketing' },
  { name: 'Table Usine', theme: 'Industrie, conseil & innovation' }
];

/**
 * Placement glouton : chaque invité rejoint la table où il crée le plus
 * d'opportunités, sans dépasser la capacité, et jamais avec son conjoint.
 */
function buildTables(): NetTable[] {
  const capacity = Math.ceil(NET_GUESTS.length / TABLE_NAMES.length);
  const tables: NetTable[] = TABLE_NAMES.map((t, i) => ({ id: `nt${i + 1}`, ...t, guests: [] }));

  // Graines thématiques : on amorce chaque table avec ses secteurs phares.
  const seeds: Sector[][] = [
    ['startup', 'juridique'],
    ['immobilier', 'architecture'],
    ['restauration', 'evenementiel'],
    ['industrie', 'conseil']
  ];
  const placed = new Set<string>();
  seeds.forEach((sectors, ti) => {
    sectors.forEach((sec) => {
      const pick = NET_GUESTS.find(
        (x) =>
          x.sector === sec &&
          !placed.has(x.id) &&
          !tables[ti].guests.some((gid) => NET_BY_ID[gid].partner === x.id)
      );
      if (pick) {
        tables[ti].guests.push(pick.id);
        placed.add(pick.id);
      }
    });
  });

  // Les plus « connecteurs » d'abord : ceux qui ont le plus de synergies possibles.
  const rest = NET_GUESTS.filter((x) => !placed.has(x.id)).sort(
    (a, b) =>
      NET_GUESTS.filter((y) => synergyOf(b, y)).length - NET_GUESTS.filter((y) => synergyOf(a, y)).length
  );

  rest.forEach((x) => {
    let best: NetTable | null = null;
    let bestScore = -Infinity;
    tables.forEach((t) => {
      if (t.guests.length >= capacity) return;
      const score = t.guests.reduce((s, gid) => s + pairScore(x, NET_BY_ID[gid]), 0);
      if (score > bestScore) {
        bestScore = score;
        best = t;
      }
    });
    (best ?? tables.find((t) => t.guests.length < capacity) ?? tables[0]).guests.push(x.id);
  });

  return tables;
}

export const NET_TABLES: NetTable[] = buildTables();

/** Groupe « Équipe » : présent sur le cadran, hors plan de tables. */
export const TEAM_GROUP: NetTable = {
  id: 'team',
  name: 'Équipe',
  theme: 'Mariés, témoins & prestataires',
  guests: NET_TEAM.map((t) => t.id)
};

export const TABLE_OF: Record<string, NetTable> = Object.fromEntries(
  [...NET_TABLES, TEAM_GROUP].flatMap((t) => t.guests.map((gid) => [gid, t]))
);

export interface Opportunity {
  a: string;
  b: string;
  why: string;
}

export function opportunitiesAt(table: NetTable): Opportunity[] {
  const out: Opportunity[] = [];
  for (let i = 0; i < table.guests.length; i++) {
    for (let j = i + 1; j < table.guests.length; j++) {
      const x = NET_BY_ID[table.guests[i]];
      const y = NET_BY_ID[table.guests[j]];
      const why = synergyOf(x, y);
      if (why) out.push({ a: x.id, b: y.id, why });
    }
  }
  return out;
}
