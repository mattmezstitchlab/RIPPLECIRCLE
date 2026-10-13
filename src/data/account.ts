import type { Interest, Sector } from './networking';

export type RSVPStatus = 'yes' | 'no' | 'maybe';
export type MealChoice = 'poisson' | 'volaille' | 'vegetarien';
export type JourneyKind = 'naissance' | 'etudes' | 'diplome' | 'travail' | 'personnel' | 'autre';

export interface JourneyMilestone {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  detail: string;
  kind: JourneyKind;
  shared: boolean;
}

export interface AccountState {
  /** L'identité éditée vient remplacer le profil de démonstration n1 dans le Ripple. */
  profileId: string;
  first: string;
  last: string;
  job: string;
  company: string;
  sector: Sector;
  interests: Interest[];
  seeking: string;
  bio: string;
  email: string;
  phone: string;
  avatarUrl: string;
  contactVisible: boolean;
  rsvp: RSVPStatus;
  partySize: number;
  meal: MealChoice;
  allergy: string;
  needsShuttle: boolean;
  accessNeeds: string;
  journey: JourneyMilestone[];
}

export const INITIAL_ACCOUNT: AccountState = {
  profileId: 'n1',
  first: 'Antoine',
  last: 'Moreau',
  job: 'Fondateur',
  company: 'Kelvin (SaaS énergie)',
  sector: 'startup',
  interests: ['tech', 'sport', 'voyage'],
  seeking: 'Lever 2 M€ en seed',
  bio: 'Ingénieur énergie devenu entrepreneur. Je relie la tech, la transition et les gens qui ont envie de faire.',
  email: 'antoine@example.fr',
  phone: '+33 6 12 34 56 78',
  avatarUrl: 'https://i.pravatar.cc/240?img=8',
  contactVisible: true,
  rsvp: 'yes',
  partySize: 2,
  meal: 'poisson',
  allergy: '',
  needsShuttle: false,
  accessNeeds: '',
  journey: [
    {
      id: 'journey-birth',
      date: '1993-04-12',
      title: 'Naissance à Lyon',
      detail: 'Une enfance entre les monts du Lyonnais et les grandes tablées familiales.',
      kind: 'naissance',
      shared: true
    },
    {
      id: 'journey-school',
      date: '2011-09-01',
      title: 'École d’ingénieur',
      detail: 'Découverte de l’efficacité énergétique et des systèmes urbains.',
      kind: 'etudes',
      shared: true
    },
    {
      id: 'journey-degree',
      date: '2016-06-24',
      title: 'Diplôme d’ingénieur',
      detail: 'Spécialité énergie et environnement.',
      kind: 'diplome',
      shared: true
    },
    {
      id: 'journey-first-job',
      date: '2017-10-02',
      title: 'Première mission',
      detail: 'Audit énergétique de bâtiments tertiaires.',
      kind: 'travail',
      shared: false
    },
    {
      id: 'journey-kelvin',
      date: '2023-03-15',
      title: 'Création de Kelvin',
      detail: 'Notre premier client pilote branche ses bâtiments à la plateforme.',
      kind: 'travail',
      shared: true
    }
  ]
};
/** Remove the obsolete theme preference without touching user profile fields. */
export function migrateAccountLightOnly(value: AccountState & { theme?: unknown }): AccountState {
  const copy = { ...value };
  delete copy.theme;
  return copy;
}
export function freshDemoAccount(): AccountState {
  return { ...INITIAL_ACCOUNT, interests: [...INITIAL_ACCOUNT.interests],
    journey: INITIAL_ACCOUNT.journey.map(item => ({ ...item })) };
}
