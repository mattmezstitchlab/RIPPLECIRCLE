import type {
  GatheringTemplate,
  Gathering,
  Moment,
  MediaItem,
  Track,
  TrackSet,
  Person,
  Group,
  EventDocument
} from '../schema/core';
import { hhmm, minutesOfDay } from '../schema/core';
import {
  NET_BY_ID,
  NET_TABLES,
  TEAM_GROUP,
  TABLE_OF,
  SECTOR_LABEL
} from '../data/networking';
import { DAY_MOMENTS } from '../data/dayOf';
import { MEMORIES } from '../data/memory';
import { BASE_TRACKS, SETS } from '../data/playlist';
import { DOCS } from '../data/documents';
import { GUEST_STORY } from '../data/guestStories';

/* ============================== Gabarit ============================== */

export const WEDDING_TEMPLATE: GatheringTemplate = {
  id: 'mariage',
  label: 'Mariage',
  tagline: 'Célébrer un couple, réunir deux familles, créer des ponts.',
  icon: 'heart',
  goal: 'famille',
  words: {
    gathering: 'Mariage',
    host: 'Les mariés',
    guest: 'Invité',
    group: 'Table',
    staff: 'Prestataires',
    media: 'Le film du jour J',
    schedule: 'Conducteur du jour J',
    playlist: 'Playlist',
    journey: 'Parcours'
  },
  accent: '#FF375F'
};

/* ====================== Adaptation des personnes ====================== */

function toPerson(id: string): Person {
  const p = NET_BY_ID[id];
  if (!p) {
    return {
      id,
      first: 'Invité',
      last: '',
      job: '',
      company: '',
      interests: [],
      seeking: '',
      roleId: 'invite',
      isStaff: false
    };
  }
  return {
    id: p.id,
    first: p.first,
    last: p.last,
    job: p.job,
    company: p.company,
    sector: p.sector,
    interests: p.interests,
    seeking: p.seeking,
    bio: GUEST_STORY[p.id],
    photo: p.photo,
    partnerId: p.partner,
    roleId: p.roleId ?? 'invite',
    groupId: TABLE_OF[p.id]?.id,
    isStaff: p.kind === 'team'
  };
}

/* ========================== Moments & signaux ========================= */

function toMoment(m: (typeof DAY_MOMENTS)[number]): Moment {
  return {
    id: m.id,
    at: m.at,
    title: m.title,
    place: m.lieu,
    roleIds: m.roles,
    tasks: m.tasks,
    isKey: m.cle,
    delayMinutes: m.retard,
    cause: m.cause,
    planB: m.planB,
    impacts: m.impacts?.map((i) => ({ roleId: i.role, text: i.text }))
  };
}

/* ============================== Playlist ============================== */

const SET_ID_MAP: Record<string, TrackSet> = {
  ceremonie: { id: 'ceremonie', label: SETS.ceremonie.label, color: SETS.ceremonie.color },
  lounge: { id: 'lounge', label: SETS.lounge.label, color: SETS.lounge.color },
  transition: { id: 'transition', label: SETS.transition.label, color: SETS.transition.color },
  diner: { id: 'diner', label: SETS.diner.label, color: SETS.diner.color },
  soiree: { id: 'soiree', label: SETS.soiree.label, color: SETS.soiree.color }
};

function toTrack(t: (typeof BASE_TRACKS)[number]): Track {
  return {
    id: t.id,
    title: t.title,
    artist: t.artist,
    minutes: t.minutes,
    proposedBy: t.by,
    setId: t.set,
    startsAt: t.at,
    signal: t.signal,
    tag: t.tag
  };
}

/* =============================== Médias =============================== */

function toMedia(m: (typeof MEMORIES)[number]): MediaItem {
  return {
    id: m.id,
    at: m.at,
    authorId: m.author,
    kind: m.type,
    url: m.url,
    legend: m.legend,
    durationSeconds: m.duration
  };
}

/* ============================= Documents ============================= */

function toDocument(id: string, doc: (typeof DOCS)[string][number]): EventDocument {
  return {
    id: doc.id,
    title: doc.title,
    kind: doc.kind,
    status: doc.status,
    reference: doc.number,
    summary: doc.summary,
    date: doc.date,
    ownerRoleId: id,
    lines: doc.lines?.map((l) => ({
      label: l.label,
      quantity: l.qty,
      unit: l.unit,
      unitPriceHT: l.priceHT
    })),
    vatRate: doc.vatRate,
    paidPercent: doc.paid,
    dueDate: doc.dueDate,
    validity: doc.validity,
    paymentTerms: doc.paymentTerms,
    clauses: doc.clauses,
    specs: doc.specs,
    body: doc.body,
    checklist: doc.checklist
  };
}

/* ========================= Le rassemblement ========================= */

export const WEDDING_GATHERING: Gathering = {
  id: 'chantilly-2026',
  templateId: WEDDING_TEMPLATE.id,
  title: 'Alexandre & Sophie',
  place: 'Domaine de Chantilly',
  date: '2026-10-11',
  goal: 'famille',
  people: Object.keys(NET_BY_ID).map(toPerson),
  groups: [...NET_TABLES, TEAM_GROUP].map((t) => ({
    id: t.id,
    name: t.name,
    theme: t.theme,
    memberIds: t.guests
  })),
  moments: DAY_MOMENTS.map(toMoment),
  trackSets: Object.values(SET_ID_MAP),
  tracks: BASE_TRACKS.map(toTrack),
  media: MEMORIES.map(toMedia),
  documents: Object.entries(DOCS).flatMap(([key, docs]) => docs.map((d) => toDocument(key, d))),
  sharedJourney: []
};

/* ====================== Lectures dérivées utiles ====================== */

export const WEDDING_PEOPLE: Person[] = WEDDING_GATHERING.people;
export const WEDDING_TRACK_SETS: TrackSet[] = WEDDING_GATHERING.trackSets;

export const guestCount = (gathering: Gathering): number =>
  gathering.people.filter((p) => !p.isStaff).length;

export const capacityLabel = (group: Group): string => `${group.name} · ${group.memberIds.length}`;

/** Enquête de cohérence : ce que le schéma révèle, à corriger côté contenu. */
export function auditGathering(gathering: Gathering) {
  const people = gathering.people;
  const seated = people.filter((p) => p.groupId && p.groupId !== 'team');
  const placedIds = new Set(gathering.groups.flatMap((g) => g.memberIds));
  const orphans = people.filter((p) => !placedIds.has(p.id));
  const sectors = new Set(people.map((p) => p.sector).filter(Boolean));
  return {
    people: people.length,
    guests: guestCount(gathering),
    staff: people.filter((p) => p.isStaff).length,
    groups: gathering.groups.length,
    moments: gathering.moments.length,
    tracks: gathering.tracks.length,
    media: gathering.media.length,
    documents: gathering.documents.length,
    seats: seated.length,
    orphans: orphans.length,
    sectors: sectors.size
  };
}

export const WEDDING_AUDIT = auditGathering(WEDDING_GATHERING);

export const SYNERGY_BY_PAIR = new Map<string, string>();
Object.entries({
  'startup+investissement': 'Levée de fonds',
  'startup+juridique': 'Statuts & pacte d’associés',
  'startup+marketing': 'Lancement produit',
  'immobilier+architecture': 'Projet de rénovation',
  'immobilier+investissement': 'Investissement locatif',
  'immobilier+juridique': 'Acte & montage SCI',
  'restauration+marketing': 'Visibilité & clientèle',
  'restauration+evenementiel': 'Traiteur pour événements',
  'restauration+architecture': 'Aménagement de salle',
  'sante+startup': 'Healthtech',
  'sante+investissement': 'Ouverture de cabinet',
  'industrie+conseil': 'Transformation',
  'industrie+startup': 'Innovation ouverte',
  'creation+marketing': 'Direction artistique',
  'creation+evenementiel': 'Scénographie',
  'conseil+investissement': 'Due diligence',
  'evenementiel+marketing': 'Activation de marque',
  'architecture+creation': 'Design d’intérieur'
}).forEach(([pair, why]) => SYNERGY_BY_PAIR.set(pair, why));

export const synergyLabel = (a?: string, b?: string): string | null => {
  if (!a || !b) return null;
  return SYNERGY_BY_PAIR.get(`${a}+${b}`) ?? SYNERGY_BY_PAIR.get(`${b}+${a}`) ?? null;
};

export const sectorLabel = (sector?: string): string => (sector ? SECTOR_LABEL[sector as keyof typeof SECTOR_LABEL] ?? sector : '');

export const minutesOf = minutesOfDay;
export const timeOf = hhmm;
