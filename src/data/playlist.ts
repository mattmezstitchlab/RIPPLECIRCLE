import { timeToMinutesFrom17 } from '../utils/time';

/*
 * La playlist de la soirée remplace la partition : chaque morceau est un
 * repère temporel. Les morceaux sont proposés par les convives et l'équipe ;
 * certains sont des « signaux » sonores qui annoncent un moment clé.
 */

export type SetId = 'ceremonie' | 'lounge' | 'transition' | 'diner' | 'soiree';

export const SETS: Record<SetId, { label: string; color: string }> = {
  ceremonie: { label: 'Cérémonie', color: '#30D158' },
  lounge: { label: 'Lounge cocktail', color: '#0A84FF' },
  transition: { label: 'Passage à table', color: '#5E5CE6' },
  diner: { label: 'Dîner', color: '#FF9F0A' },
  soiree: { label: 'Soirée', color: '#BF5AF2' }
};

export interface Signal {
  /** Le moment annoncé par le morceau. */
  label: string;
  /** Ce que chacun fait en l'entendant. */
  cue: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  /** Durée programmée, en minutes. */
  minutes: number;
  /** Personne qui a proposé le morceau (identifiant du graphe des convives). */
  by: string;
  set: SetId;
  signal?: Signal;
  /** Annotation de régie (prolongation, proposition programmée…). */
  tag?: string;
  /** Heure de départ imposée : ouvre un nouveau segment de la soirée. */
  at?: string;
}

export interface ScheduledTrack extends Track {
  start: number;
  end: number;
}

export const PLAYLIST_START = timeToMinutesFrom17('18:00');

const RETARD = 'Prolongation · retard traiteur';
export const PROGRAMMED_TAG = 'Propositions programmées';

export const BASE_TRACKS: Track[] = [
  // ---- Cérémonie · 18:00 ----
  {
    id: 'c1',
    title: 'Canon en Ré',
    artist: 'Pachelbel (quatuor à cordes)',
    minutes: 6,
    by: 't-planner',
    set: 'ceremonie',
    at: '18:00',
    signal: { label: 'Entrée du cortège', cue: 'Levez-vous, le cortège arrive' }
  },
  { id: 'c2', title: 'River Flows in You', artist: 'Yiruma', minutes: 4, by: 't-temoins', set: 'ceremonie' },
  { id: 'c3', title: 'A Thousand Years', artist: 'Christina Perri', minutes: 5, by: 't-maries', set: 'ceremonie' },
  { id: 'c4', title: 'Signed, Sealed, Delivered', artist: 'Stevie Wonder', minutes: 4, by: 'n12', set: 'ceremonie' },

  // ---- Cocktail · 19:30 ----
  { id: 'k1', title: 'Misty', artist: 'Erroll Garner Trio', minutes: 4, by: 'n26', set: 'lounge', at: '19:30' },
  { id: 'k2', title: 'The Girl from Ipanema', artist: 'Stan Getz & João Gilberto', minutes: 4, by: 'n15', set: 'lounge' },
  { id: 'k3', title: 'Isn’t She Lovely', artist: 'Stevie Wonder', minutes: 4, by: 'n8', set: 'lounge' },
  { id: 'k4', title: 'La Belle Vie', artist: 'Sacha Distel', minutes: 4, by: 'n5', set: 'lounge' },
  { id: 'k5', title: 'Blue in Green', artist: 'Miles Davis', minutes: 5, by: 'n28', set: 'lounge' },
  { id: 'k6', title: 'Menilmontant', artist: 'Django Reinhardt', minutes: 4, by: 'n31', set: 'lounge' },
  { id: 'k7', title: 'Fly Me to the Moon (live)', artist: 'Quartet du domaine', minutes: 5, by: 'n24', set: 'lounge' },

  // ---- Cocktail · deuxième heure, segment piloté par la régie · 21:00 ----
  { id: 'p1', title: 'Sunset Lover', artist: 'Petit Biscuit', minutes: 4, by: 't-dj', set: 'lounge', at: '21:00' },
  { id: 'p2', title: 'Tadow', artist: 'Masego & FKJ', minutes: 4, by: 'n1', set: 'lounge' },
  { id: 'p3', title: 'Breathe', artist: 'Télépopmusik', minutes: 4, by: 'n4', set: 'lounge' },
  { id: 'p4', title: 'La Femme d’argent', artist: 'Air', minutes: 4, by: 'n10', set: 'lounge', tag: RETARD },
  { id: 'p5', title: 'Lovely Day', artist: 'Bill Withers', minutes: 4, by: 'n8', set: 'lounge', tag: RETARD },
  { id: 'p6', title: 'Sweet Disposition', artist: 'The Temper Trap', minutes: 4, by: 'n19', set: 'lounge', tag: RETARD },
  { id: 'p7', title: 'Golden Hour', artist: 'JVKE', minutes: 3, by: 't-photo', set: 'lounge' },
  {
    id: 'p8',
    title: 'Feeling Good',
    artist: 'Nina Simone',
    minutes: 4,
    by: 't-planner',
    set: 'transition',
    signal: { label: 'Appel en salle', cue: 'Rejoignez votre table' }
  },
  { id: 'p9', title: 'Valerie', artist: 'Amy Winehouse', minutes: 4, by: 'n2', set: 'transition' },
  { id: 'p10', title: 'Dreams', artist: 'Fleetwood Mac', minutes: 4, by: 'n3', set: 'transition' },
  {
    id: 'p11',
    title: 'Experience',
    artist: 'Ludovico Einaudi',
    minutes: 3,
    by: 't-temoins',
    set: 'transition',
    signal: { label: 'Lumières tamisées', cue: 'Les mariés arrivent' }
  },
  {
    id: 'p12',
    title: 'A Sky Full of Stars',
    artist: 'Coldplay',
    minutes: 4,
    by: 't-maries',
    set: 'transition',
    signal: { label: 'Entrée des mariés', cue: 'Levez-vous, serviettes en l’air' }
  },
  { id: 'p13', title: 'La Vie en rose', artist: 'Louis Armstrong', minutes: 4, by: 'n7', set: 'diner' },
  {
    id: 'p14',
    title: 'Fly Me to the Moon',
    artist: 'Frank Sinatra',
    minutes: 4,
    by: 'n20',
    set: 'diner',
    signal: { label: 'Dîner servi', cue: 'Bon appétit' }
  },
  { id: 'p15', title: 'Cheek to Cheek', artist: 'Ella Fitzgerald & Louis Armstrong', minutes: 4, by: 'n12', set: 'diner' },
  { id: 'p16', title: 'Dream a Little Dream of Me', artist: 'Ella Fitzgerald', minutes: 4, by: 'n24', set: 'diner' },

  // ---- Dîner · suite ----
  { id: 'd1', title: 'Beyond the Sea', artist: 'Bobby Darin', minutes: 4, by: 'n32', set: 'diner' },
  { id: 'd2', title: 'L.O.V.E.', artist: 'Nat King Cole', minutes: 3, by: 'n14', set: 'diner' },
  { id: 'd3', title: 'Something Stupid', artist: 'Frank & Nancy Sinatra', minutes: 3, by: 'n17', set: 'diner' },
  { id: 'd4', title: 'Les Moulins de mon cœur', artist: 'Michel Legrand', minutes: 4, by: 'n27', set: 'diner' },
  { id: 'd5', title: 'What a Wonderful World', artist: 'Louis Armstrong', minutes: 4, by: 'n29', set: 'diner' },
  {
    id: 'd6',
    title: 'Firestone (orchestral)',
    artist: 'Kygo',
    minutes: 4,
    by: 't-dj',
    set: 'diner',
    at: '23:45',
    signal: { label: 'Pièce montée', cue: 'Étincelles froides, tous autour de la piste' }
  },
  { id: 'd7', title: 'Can’t Take My Eyes Off You', artist: 'Frankie Valli', minutes: 4, by: 'n21', set: 'diner' },

  // ---- Soirée · 00:00 ----
  {
    id: 's1',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    minutes: 4,
    by: 't-maries',
    set: 'soiree',
    at: '00:00',
    signal: { label: 'Ouverture de bal', cue: 'Les mariés ouvrent, rejoignez-les au refrain' }
  },
  { id: 's2', title: 'September', artist: 'Earth, Wind & Fire', minutes: 4, by: 'n19', set: 'soiree' },
  { id: 's3', title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', minutes: 4, by: 'n13', set: 'soiree' },
  { id: 's4', title: 'Get Lucky', artist: 'Daft Punk ft. Pharrell Williams', minutes: 5, by: 'n30', set: 'soiree' },
  { id: 's5', title: 'I Follow Rivers', artist: 'Lykke Li (remix)', minutes: 4, by: 'n10', set: 'soiree' },
  { id: 's6', title: 'Dancing Queen', artist: 'ABBA', minutes: 4, by: 'n6', set: 'soiree' },
  { id: 's7', title: 'Freed from Desire', artist: 'Gala', minutes: 4, by: 'n18', set: 'soiree' },
  { id: 's8', title: 'Alors on danse', artist: 'Stromae', minutes: 4, by: 'n25', set: 'soiree' },
  { id: 's9', title: 'Les derniers slows', artist: 'Set acoustique du DJ', minutes: 6, by: 't-dj', set: 'soiree', at: '03:50' },
  { id: 's10', title: 'Emmenez-moi', artist: 'Charles Aznavour', minutes: 4, by: 'n2', set: 'soiree' }
];

/** Place les morceaux bout à bout ; un morceau avec `at` ouvre un nouveau segment. */
export function schedule(tracks: Track[]): ScheduledTrack[] {
  let t = PLAYLIST_START;
  return tracks.map((track) => {
    if (track.at) t = timeToMinutesFrom17(track.at);
    const scheduled = { ...track, start: t, end: t + track.minutes };
    t += track.minutes;
    return scheduled;
  });
}

export type Moment = 'cocktail' | 'diner' | 'soiree';

export const MOMENT_LABEL: Record<Moment, string> = {
  cocktail: 'le cocktail',
  diner: 'le dîner',
  soiree: 'la soirée dansante'
};

export const MOMENTS: { id: Moment; label: string; set: SetId }[] = [
  { id: 'cocktail', label: 'Cocktail', set: 'lounge' },
  { id: 'diner', label: 'Dîner', set: 'diner' },
  { id: 'soiree', label: 'Soirée', set: 'soiree' }
];

export interface Proposal {
  id: string;
  title: string;
  artist: string;
  by: string;
  moment: Moment;
  likes: number;
}

export const SEED_PROPOSALS: Proposal[] = [
  { id: 'q1', title: 'Dancing Queen', artist: 'ABBA', by: 'n6', moment: 'soiree', likes: 12 },
  { id: 'q2', title: 'Get Lucky', artist: 'Daft Punk ft. Pharrell Williams', by: 'n13', moment: 'soiree', likes: 9 },
  { id: 'q3', title: 'Latch', artist: 'Disclosure ft. Sam Smith', by: 'n30', moment: 'soiree', likes: 5 },
  { id: 'q4', title: 'Les Champs-Élysées', artist: 'Joe Dassin', by: 'n5', moment: 'diner', likes: 3 }
];
