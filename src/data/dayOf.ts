export type DayRole = 'maries' | 'temoin' | 'traiteur' | 'photographe' | 'dj' | 'invite' | 'planner' | 'parents' | 'logistique';

/*
 * Le jour J, en « conducteur » : chaque moment avec son lieu, ses
 * responsables, ses tâches, et — quand il y a un incident — la causalité
 * (la cause), le plan B et les impacts en cascade.
 */

export interface DayMoment {
  id: string;
  at: string;
  title: string;
  lieu: string;
  roles: DayRole[];
  /** Missions et tâches à ce moment. */
  tasks: string[];
  /** Incident : retard en minutes. */
  retard?: number;
  /** La cause de l'écart. */
  cause?: string;
  /** Le plan B appliqué. */
  planB?: string;
  /** Impacts en cascade sur les autres rôles. */
  impacts?: { role: DayRole; text: string }[];
  /** Moment clé de la soirée. */
  cle?: boolean;
}

export const DAY_MOMENTS: DayMoment[] = [
  {
    id: 'd1',
    at: '15:00',
    title: 'Installation & briefing régie',
    lieu: 'Point de coordination central',
    roles: ['planner', 'logistique'],
    tasks: ['Briefing des 10 intervenants', 'Vérification des canaux radio', 'Ouverture du poste de régie'],
    cle: false
  },
  {
    id: 'd2',
    at: '17:00',
    title: 'Accueil des prestataires',
    lieu: 'Entrée Sud — Domaine',
    roles: ['logistique', 'planner'],
    tasks: ['Pointage des équipes', 'Remise des badges et consignes', 'Allumage des extérieurs à la tombée du jour'],
    cle: false
  },
  {
    id: 'd3',
    at: '17:30',
    title: 'Préparation de la cérémonie',
    lieu: 'Parc Est — Arche fleurie',
    roles: ['temoin', 'photographe', 'dj'],
    tasks: ['Placement des micros', 'Test du Canon en Ré', 'Dernier repérage photo'],
    cle: false
  },
  {
    id: 'd4',
    at: '18:00',
    title: 'Cérémonie laïque',
    lieu: 'Parc Est — Arche fleurie',
    roles: ['maries', 'temoin', 'parents', 'photographe', 'dj'],
    tasks: ['Entrée du cortège', 'Échange des vœux', 'Sortie sous pluie de pétales'],
    cle: true
  },
  {
    id: 'd5',
    at: '19:30',
    title: 'Cocktail & sabrage',
    lieu: 'Terrasse du Château & Orangerie',
    roles: ['traiteur', 'dj', 'photographe', 'planner'],
    tasks: ['Ouverture des buffets', 'Playlist lounge', 'Photos de groupes', 'Sabrage du champagne'],
    cle: true
  },
  {
    id: 'd6',
    at: '20:45',
    title: 'Photos couple — golden hour',
    lieu: 'Bassin des nymphéas',
    roles: ['photographe', 'maries'],
    tasks: ['Portraits au bord du bassin', 'Clichés de la famille proche'],
    cle: false
  },
  {
    id: 'd7',
    at: '21:08',
    title: 'Retard traiteur détecté',
    lieu: 'Office traiteur — Bâtiment A',
    roles: ['traiteur', 'planner'],
    tasks: ['Dressage des entrées en cours', 'Four N°2 recalibré'],
    retard: 12,
    cause: 'Cocktail prolongé de 7 min par la météo douce + réglage du four N°2 (+5 min).',
    planB: 'Compenser 10 min sur le créneau du dessert ; dressage par vagues de 40 assiettes.',
    impacts: [
      { role: 'dj', text: 'Lounge prolongé de 3 titres pour couvrir l’attente.' },
      { role: 'photographe', text: 'Golden hour prolongée de 8 min — 30 clichés crépusculaires.' },
      { role: 'maries', text: 'Entrée en salle calée à 21:42 au lieu de 21:30.' },
      { role: 'invite', text: 'Dîner à table à 21:45 ; le bar reste ouvert.' }
    ],
    cle: true
  },
  {
    id: 'd8',
    at: '21:13',
    title: 'Arbitrage validé',
    lieu: 'Poste de régie',
    roles: ['planner', 'traiteur'],
    tasks: ['Validation du plan B', 'Notification à toute l’équipe'],
    planB: 'Plan B confirmé : dessert avancé de 10 min, ouverture de bal à 00:00 maintenue.',
    cle: false
  },
  {
    id: 'd9',
    at: '21:27',
    title: 'Appel en salle',
    lieu: 'Grande Galerie des Glaces',
    roles: ['planner', 'invite', 'temoin', 'traiteur'],
    tasks: ['Annonce au micro', 'Ouverture des portes', 'Mise en place des tables'],
    cle: false
  },
  {
    id: 'd10',
    at: '21:42',
    title: 'Entrée des mariés & service des entrées',
    lieu: 'Grande Galerie des Glaces',
    roles: ['maries', 'traiteur', 'dj', 'photographe'],
    tasks: ['Jingle Coldplay — drop à 0:45', 'Faisceaux dorés', 'Service des 140 entrées par vagues', 'Photos depuis l’escalier'],
    cle: true
  },
  {
    id: 'd11',
    at: '22:15',
    title: 'Discours',
    lieu: 'Table d’honneur',
    roles: ['temoin', 'parents', 'dj'],
    tasks: ['Père de la mariée (6 min)', 'Témoins Clara & Julien (5 min 40)', 'Fond sonore tamisé à −15 dB'],
    cle: true
  },
  {
    id: 'd12',
    at: '22:45',
    title: 'Projection surprise',
    lieu: 'Écran fond de scène',
    roles: ['temoin'],
    tasks: ['Lancement sur signal « lumière dorée »', 'Durée 4 min 20'],
    cle: false
  },
  {
    id: 'd13',
    at: '23:10',
    title: 'Jeu des mariés',
    lieu: 'Piste centrale',
    roles: ['temoin', 'dj'],
    tasks: ['Animation par les témoins', 'Participation des tables'],
    cle: false
  },
  {
    id: 'd14',
    at: '23:45',
    title: 'Pièce montée & étincelles',
    lieu: 'Piste centrale',
    roles: ['traiteur', 'dj', 'photographe'],
    tasks: ['Chari central & fontaine de chocolat', 'Pyro froide 2 m', 'Kygo — Firestone (drop orchestral)'],
    cle: true
  },
  {
    id: 'd15',
    at: '00:00',
    title: 'Ouverture de bal',
    lieu: 'Piste de danse',
    roles: ['maries', 'dj'],
    tasks: ['Perfect → medley funk 70s', 'Fumée lourde au sol', 'Douche de lumière ambrée'],
    cle: true
  },
  {
    id: 'd16',
    at: '02:00',
    title: 'Soirée dansante',
    lieu: 'Piste de danse',
    roles: ['dj'],
    tasks: ['Set deep house & disco', 'Ouverture du bar jusqu’à 04:00'],
    cle: false
  },
  {
    id: 'd17',
    at: '04:00',
    title: 'Fin de la réception',
    lieu: 'Grande Galerie',
    roles: ['planner', 'logistique'],
    tasks: ['Dernier métro & navettes', 'Remerciements aux équipes'],
    cle: false
  },
  {
    id: 'd18',
    at: '05:00',
    title: 'Démontage',
    lieu: 'Domaine de Chantilly',
    roles: ['logistique', 'traiteur'],
    tasks: ['Rangement des espaces', 'Restitution du mobilier', 'Clôture du dossier régie'],
    cle: false
  }
];
