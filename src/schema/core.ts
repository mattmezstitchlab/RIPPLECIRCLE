/*
 * Schéma unique de la plateforme — couche « invariant ».
 *
 * Un Rassemblement (Gathering) est le conteneur : mariage, apporteur
 * d'affaires, speed dating, salon, team building, soirée. Le mariage est un
 * gabarit (Template) de cet objet, pas un cas particulier codé en dur.
 *
 * Trois couches :
 *   1. Invariant     : personnes, groupes, moments, timeline, médias, parcours
 *   2. Configurable  : objectif de matching, rôles, phases, règles, documents
 *   3. Cosmétique    : icônes, couleurs, libellés
 */

/* ============================== Personne ============================== */

/** Centre d'intérêt partagé par toutes les personnes du réseau. */
export type InterestId =
  | 'tech' | 'art' | 'gastro' | 'sport' | 'voyage'
  | 'finance' | 'musique' | 'nature' | 'sante' | 'education' | 'immobilier';

export const INTEREST_META: Record<InterestId, { label: string; color: string }> = {
  tech: { label: 'Tech', color: '#0A84FF' },
  art: { label: 'Art & design', color: '#BF5AF2' },
  gastro: { label: 'Gastronomie', color: '#FF9F0A' },
  sport: { label: 'Sport', color: '#FF453A' },
  voyage: { label: 'Voyage', color: '#64D2FF' },
  finance: { label: 'Finance', color: '#30D158' },
  musique: { label: 'Musique', color: '#FF375F' },
  nature: { label: 'Nature', color: '#34C759' },
  sante: { label: 'Santé', color: '#5E5CE6' },
  education: { label: 'Éducation', color: '#FFD60A' },
  immobilier: { label: 'Immobilier', color: '#D96B00' }
};

export const INTEREST_LIST = Object.entries(INTEREST_META).map(([id, meta]) => ({
  id: id as InterestId,
  ...meta
}));

/** Univers professionnel : sert aux règles de complémentarité. */
export type SectorId =
  | 'startup' | 'investissement' | 'juridique' | 'immobilier' | 'architecture'
  | 'marketing' | 'restauration' | 'sante' | 'industrie' | 'creation'
  | 'conseil' | 'evenementiel' | 'education' | 'art' | 'recherche';

export const SECTOR_LABEL: Record<SectorId, string> = {
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
  evenementiel: 'Événementiel',
  education: 'Éducation',
  art: 'Art & culture',
  recherche: 'Recherche'
};

/**
 * Une personne du réseau. Le compte (profil édité) et l'invité d'un
 * rassemblement pointent tous deux vers ce schéma.
 */
export interface Person {
  id: string;
  first: string;
  last: string;
  job: string;
  company?: string;
  sector?: SectorId;
  interests: InterestId[];
  /** Ce que la personne cherche ou peut offrir. */
  seeking: string;
  /** Parcours en quelques lignes. */
  bio?: string;
  photo?: string;
  /** Conjoint / conjointe : utile pour les règles de séparation. */
  partnerId?: string;
  /** Rôle joué dans le rassemblement courant. */
  roleId: string;
  /** Groupe d'affectation (table, piste, zone…). */
  groupId?: string;
  /** Membre de l'organisation plutôt que participant. */
  isStaff?: boolean;
  /** Coordonnées : visibles seulement si consentement. */
  contact?: { email: string; phone: string; visible: boolean };
}

/** Raison d'une mise en relation entre deux personnes. */
export interface MatchRule {
  a: SectorId | InterestId;
  b: SectorId | InterestId;
  why: string;
  /** Poids de la règle dans le score d'affinité. */
  weight?: number;
}

/* =============================== Groupe =============================== */

/**
 * Groupe d'affectation : table, piste de danse, atelier, zone de salon…
 * Le nom dépend du gabarit, la mécanique est la même.
 */
export interface Group {
  id: string;
  name: string;
  theme?: string;
  capacity?: number;
  memberIds: string[];
}

/* ========================= Moment & conducteur ======================== */

/** Statut de progression d'un moment. */
export type MomentStatus = 'ok' | 'late' | 'adjust' | 'wait';

export const MOMENT_STATUS_META: Record<MomentStatus, { label: string; dot: string; text: string }> = {
  ok: { label: 'À l’heure', dot: '#30D158', text: '#1E7A39' },
  late: { label: 'En retard', dot: '#FF453A', text: '#C7342B' },
  adjust: { label: 'Ajustement', dot: '#FF9F0A', text: '#9A5B00' },
  wait: { label: 'En attente', dot: '#AEAEB2', text: '#6E6E73' }
};

/** Un moment du conducteur, avec sa causalité si un écart est survenu. */
export interface Moment {
  id: string;
  /** HH:mm */
  at: string;
  title: string;
  place: string;
  roleIds: string[];
  tasks: string[];
  isKey?: boolean;
  /** Écart constaté, en minutes. */
  delayMinutes?: number;
  cause?: string;
  planB?: string;
  impacts?: { roleId: string; text: string }[];
}

/* =============================== Playlist ============================= */

export type TrackSetId = string;

export interface TrackSet {
  id: TrackSetId;
  label: string;
  color: string;
}

export interface Signal {
  label: string;
  cue: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  minutes: number;
  proposedBy: string;
  setId: TrackSetId;
  /** HH:mm — ouvre un nouveau segment de la soirée. */
  startsAt?: string;
  signal?: Signal;
  tag?: string;
}

export interface ScheduledTrack extends Track {
  startMinutes: number;
  endMinutes: number;
}

/* ================================ Média =============================== */

export type MediaKind = 'photo' | 'video' | 'audio' | 'note';

export const MEDIA_KIND_META: Record<MediaKind, { label: string; color: string }> = {
  photo: { label: 'Photo', color: '#0A84FF' },
  video: { label: 'Vidéo', color: '#BF5AF2' },
  audio: { label: 'Message audio', color: '#30D158' },
  note: { label: 'Note', color: '#FF9F0A' }
}

export interface MediaItem {
  id: string;
  /** HH:mm */
  at: string;
  authorId: string;
  kind: MediaKind;
  url?: string;
  legend: string;
  /** Durée en secondes pour vidéos et audios. */
  durationSeconds?: number;
}

/* ============================ Parcours de vie ========================= */

export type JourneyKindId =
  | 'naissance' | 'etudes' | 'diplome' | 'travail' | 'personnel' | 'autre';

export const JOURNEY_KIND_META: Record<JourneyKindId, { label: string; color: string }> = {
  naissance: { label: 'Naissance', color: '#FF375F' },
  etudes: { label: 'Études', color: '#0A84FF' },
  diplome: { label: 'Diplôme', color: '#1E7A39' },
  travail: { label: 'Travail', color: '#D96B00' },
  personnel: { label: 'Personnel', color: '#BF5AF2' },
  autre: { label: 'Autre', color: '#8E8E93' }
};

export interface JourneyStep {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
  detail?: string;
  kind: JourneyKindId;
  /** Partagé aux autres participants du Ripple. */
  shared: boolean;
}

/* =============================== Document ============================= */

export type DocumentKind =
  | 'contrat' | 'devis' | 'facture' | 'fiche' | 'checklist' | 'note';

export const DOCUMENT_KIND_LABEL: Record<DocumentKind, string> = {
  contrat: 'Contrat',
  devis: 'Devis',
  facture: 'Facture',
  fiche: 'Fiche technique',
  checklist: 'Checklist',
  note: 'Note'
};

export interface DocumentLine {
  label: string;
  quantity: number;
  unit: string;
  unitPriceHT: number;
}

export interface EventDocument {
  id: string;
  title: string;
  kind: DocumentKind;
  status: string;
  reference: string;
  summary: string;
  date: string;
  /** Personne ou organisation propriétaire du document. */
  ownerRoleId?: string;
  lines?: DocumentLine[];
  vatRate?: number;
  paidPercent?: number;
  dueDate?: string;
  validity?: string;
  paymentTerms?: string;
  clauses?: { title: string; body: string }[];
  specs?: { label: string; value: string }[];
  body: string[];
  checklist?: string[];
}

/* ============================ RSVP & compte =========================== */

export type RsvpAnswer = 'yes' | 'no' | 'maybe';

export interface Rsvp {
  answer: RsvpAnswer;
  partySize: number;
  meal?: string;
  allergies?: string;
  needsShuttle?: boolean;
  accessNeeds?: string;
}

/** Profil éditable, transportable d'un rassemblement à l'autre. */
export interface AccountProfile {
  /** Identifiant de la personne du réseau que ce profil pilote. */
  personId: string;
  first: string;
  last: string;
  job: string;
  company: string;
  sector: SectorId;
  interests: InterestId[];
  seeking: string;
  bio: string;
  email: string;
  phone: string;
  avatarUrl: string;
  contactVisible: boolean;
  theme: 'day' | 'night';
  rsvp: Rsvp;
  journey: JourneyStep[];
}

/* ======================= Gabarit & rassemblement ====================== */

/**
 * Objectif du rassemblement : c'est lui qui choisit la règle de placement.
 * Le même moteur sert un mariage, un speed dating ou un salon.
 */
export type MatchingGoal =
  | 'opportunite'   // créer des liens entre métiers complémentaires
  | 'rencontre'     // affinité amoureuse, avec consentement mutuel
  | 'rotation'      // speed dating : paires imposées, rotation de tables
  | 'famille'       // séparer les familles, rapprocher les branches
  | 'equipe'        // compléter des compétences
  | 'aucun';

/** Métadonnées d'un gabarit : le « vocabulaire » d'un univers. */
export interface GatheringTemplate {
  id: string;
  label: string;
  tagline: string;
  icon: string;
  goal: MatchingGoal;
  /** Lexique affiché dans l'interface. */
  words: {
    gathering: string;   // « Mariage », « Speed dating », « Salon »
    host: string;        // « Les mariés », « L'animateur »
    guest: string;       // « Invité », « Participant »
    group: string;       // « Table », « Piste », « Zone »
    staff: string;       // « Prestataires », « Bénévoles »
    media: string;       // « Le film du jour J », « Les souvenirs »
    schedule: string;    // « Conducteur », « Programme »
    playlist: string;    // « Playlist », « Ambiance »
    journey: string;     // « Parcours », « Profil »
  };
  /** Couleur d'accent du gabarit. */
  accent: string;
}

/** Un rassemblement : mariage, soirée business, speed dating, salon… */
export interface Gathering {
  id: string;
  templateId: string;
  title: string;
  place: string;
  /** Date du rassemblement, YYYY-MM-DD. */
  date: string;
  goal: MatchingGoal;
  people: Person[];
  groups: Group[];
  moments: Moment[];
  trackSets: TrackSet[];
  tracks: Track[];
  media: MediaItem[];
  documents: EventDocument[];
  /** Étapes de vie partagées par le compte, hors rassemblement. */
  sharedJourney: JourneyStep[];
}

/** Fuseau horaire de la régie : les heures sont lues comme HH:mm locales. */
export const hhmm = (minutes: number): string => {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/** Convertit « HH:mm » en minutes depuis minuit. */
export const minutesOfDay = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/** Place bout à bout les morceaux ; un morceau avec `startsAt` ouvre un segment. */
export function scheduleTracks(tracks: Track[]): ScheduledTrack[] {
  let cursor = 0;
  return tracks.map((track) => {
    if (track.startsAt) cursor = minutesOfDay(track.startsAt);
    const scheduled: ScheduledTrack = {
      ...track,
      startMinutes: cursor,
      endMinutes: cursor + track.minutes
    };
    cursor = scheduled.endMinutes;
    return scheduled;
  });
}
