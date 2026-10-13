import type { LucideIcon } from 'lucide-react';
import { Heart, Sparkles, ChefHat, Camera, Music, Wine, Crown } from 'lucide-react';

export interface RoleEvent {
  time: string;
  title: string;
  note?: string;
  location?: string;
}

export interface RoleProfile {
  id: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string;
  darkText?: boolean;
  focusLabel: string;
  ring: { from: string; to: string; label: string };
  timeline: RoleEvent[];
  alert?: { tone: 'alert' | 'info'; title: string; text: string };
  highlight: string[];
}

export const ROLES: RoleProfile[] = [
  {
    id: 'maries',
    label: 'Mariés',
    subtitle: 'Alexandre & Sophie',
    icon: Heart,
    accent: '#FF375F',
    focusLabel: 'Votre grand soir',
    ring: { from: '17:00', to: '04:00', label: 'Votre soirée' },
    timeline: [
      { time: '18:15', title: 'Échange des vœux', location: 'Parc Est — Arche fleurie' },
      { time: '19:30', title: 'Cocktail & photos', location: 'Terrasse du Château' },
      { time: '21:42', title: 'Entrée en salle', note: 'Jingle Coldplay, faisceaux dorés', location: 'Grande Galerie des Glaces' },
      { time: '22:15', title: 'Remerciements', location: 'Table d’honneur' },
      { time: '00:00', title: 'Première danse', location: 'Piste centrale' }
    ],
    alert: {
      tone: 'info',
      title: 'Dîner décalé de 12 min',
      text: 'Votre entrée en salle est à 21:42. Profitez du cocktail, tout est fluide.'
    },
    highlight: ['maries', 'parents', 'piah-dars', 'caj']
  },
  {
    id: 'temoin',
    label: 'Témoins',
    subtitle: 'Clara, Julien, Piah & Dars',
    icon: Sparkles,
    accent: '#5E5CE6',
    focusLabel: 'Vos moments à vous',
    ring: { from: '19:30', to: '00:00', label: 'La célébration' },
    timeline: [
      { time: '21:42', title: 'Entrée en salle', location: 'Grande Galerie' },
      { time: '22:15', title: 'Votre discours', note: 'Micro HF 1 — 6 min max', location: 'Table d’honneur' },
      { time: '22:45', title: 'Projection surprise', note: 'Synchroniser avec le chef salle', location: 'Écran fond de scène' },
      { time: '23:10', title: 'Jeu des mariés', location: 'Piste centrale' },
      { time: '00:00', title: 'Ouverture de bal', location: 'Piste centrale' }
    ],
    highlight: ['piah-dars', 'caj', 'parents']
  },
  {
    id: 'traiteur',
    label: 'Traiteur',
    subtitle: 'Maison Gauthier — Service',
    icon: ChefHat,
    accent: '#FF453A',
    focusLabel: 'Ordre de service',
    ring: { from: '20:00', to: '23:45', label: 'Service' },
    timeline: [
      { time: '21:25', title: 'Ouverture des portes de salle', note: 'Appel micro par la régie' },
      { time: '21:42', title: 'Service des entrées', note: 'Carpaccio de St-Jacques — 140 assiettes' },
      { time: '22:20', title: 'Plat — cuisson minute', note: 'Suprêmes & filets de bar' },
      { time: '23:45', title: 'Pièce montée & cascade', note: 'Chari central, étincelles 2 m' },
      { time: '23:55', title: 'Retrait des couverts', note: 'Préparer la piste pour 00:00' }
    ],
    alert: {
      tone: 'alert',
      title: 'Retard +12 min',
      text: 'Dressage final en cours. Service confirmé à 21:42. Marge résiduelle : +12 min.'
    },
    highlight: ['traiteur-left', 'traiteur-right', 'wedding-planner']
  },
  {
    id: 'photographe',
    label: 'Photographe',
    subtitle: 'Lucas V. — Photo & Drone',
    icon: Camera,
    accent: '#FF9F0A',
    darkText: true,
    focusLabel: 'Liste de shots',
    ring: { from: '17:30', to: '23:45', label: 'Tournage' },
    timeline: [
      { time: '20:45', title: 'Photos couple', note: 'Golden hour — bassin des nymphéas' },
      { time: '21:42', title: 'Entrée en salle', note: '2 positions : escalier + face piste' },
      { time: '22:15', title: 'Réactions aux discours', note: 'Zoom 70-200, tables 1 à 6' },
      { time: '23:45', title: 'Gâteau & étincelles', note: 'ISO 1600 — ne pas rater le drop' },
      { time: '00:00', title: 'Premiers pas', note: 'Séquence longue exposure' }
    ],
    highlight: ['photographe']
  },
  {
    id: 'dj',
    label: 'DJ',
    subtitle: 'Marc — Pulse Live Sound',
    icon: Music,
    accent: '#BF5AF2',
    focusLabel: 'File de morceaux',
    ring: { from: '19:00', to: '04:00', label: 'Sound' },
    timeline: [
      { time: '21:15', title: 'Lounge cocktail', note: 'Playlist Sunset — volume 60%' },
      { time: '21:42', title: 'Jingle d’entrée', note: 'Coldplay — A Sky Full of Stars, drop à 0:45' },
      { time: '22:15', title: 'Micros discours', note: 'HF 1 & 2 — fond sonore −15 dB' },
      { time: '23:45', title: 'Drop pièce montée', note: 'Kygo — Firestone (orchestral)' },
      { time: '00:00', title: 'Ouverture de bal', note: 'Perfect → medley funk 70s' }
    ],
    highlight: ['dj']
  },
  {
    id: 'invite',
    label: 'Invité',
    subtitle: 'Table 7 — Famille Laurent',
    icon: Wine,
    accent: '#64D2FF',
    darkText: true,
    focusLabel: 'Votre soirée',
    ring: { from: '18:00', to: '04:00', label: 'Votre soirée' },
    timeline: [
      { time: '18:00', title: 'Cérémonie', location: 'Parc Est' },
      { time: '21:45', title: 'Dîner à table', note: 'Appel au micro à 21:25', location: 'Table 7' },
      { time: '23:45', title: 'Pièce montée', note: 'Champagne offert' },
      { time: '00:00', title: 'Soirée & danse', note: 'Bar ouvert jusqu’à 04:00' }
    ],
    alert: {
      tone: 'info',
      title: 'Dîner à 21:45',
      text: 'Le service est décalé de 12 min. Les mariés entrent à 21:42.'
    },
    highlight: ['maries', 'parents']
  },
  {
    id: 'planner',
    label: 'Planner',
    subtitle: 'Éléonore — Direction de régie',
    icon: Crown,
    accent: '#30D158',
    focusLabel: 'Poste de commandement',
    ring: { from: '17:00', to: '04:00', label: 'Régie' },
    timeline: [
      { time: '21:25', title: 'Appel en salle (micro)', note: 'Texte validé 21:10' },
      { time: '21:42', title: 'Entrée des mariés', note: 'Coordonner DJ + lumière + photo' },
      { time: '22:15', title: 'Discours N°1', note: 'Père de la mariée — 6 min' },
      { time: '23:45', title: 'Pièce montée', note: 'Pyro 2 m — brief sécurité' },
      { time: '00:00', title: 'Ouverture de bal', note: 'Fumée lourde + douche ambrée' }
    ],
    alert: {
      tone: 'alert',
      title: 'Incident : Retard Traiteur +12 min',
      text: 'Arbitrage requis : compenser sur le dessert (−10 min) ou laisser glisser. Marge : +12 min.'
    },
    highlight: [
      'maries', 'parents', 'piah-dars', 'caj',
      'traiteur-left', 'traiteur-right', 'photographe',
      'dj', 'wedding-planner', 'logistique'
    ]
  }
];
