import { Stakeholder, TimelinePhase, WeddingScenario, ActivityLog, CueItem } from '../types';

export const INITIAL_STAKEHOLDERS: Stakeholder[] = [
  {
    id: 'maries',
    name: 'Mariés',
    subtitle: 'Alexandre & Sophie',
    role: 'Les Mariés',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    statusColor: '#22c55e',
    ringColor: '#22c55e',
    angle: 135, // top-left (approx 10:00)
    battery: 98,
    walkieChannel: 'Canal 1 (VIP & Direction)',
    location: 'Terrasse du Parc — Espace Cocktail',
    currentTask: 'Photos informelles avec les invités d’honneur',
    pendingTasks: [
      'Entrée en salle pour le dîner (prévue 21:42)',
      'Discours de remerciement (22:15)',
      'Ouverture de bal (00:00)'
    ],
    alertMessage: 'En forme optimale, ravis du déroulement. Demandent si les entrées débutent bientôt.',
    phone: '+33 6 12 34 56 78'
  },
  {
    id: 'parents',
    name: 'Parents',
    subtitle: 'Familles Moreau & Laurent',
    role: 'Parents & Témoins Principaux',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
    status: 'NORMAL',
    statusColor: '#38bdf8',
    ringColor: '#38bdf8',
    angle: 175, // mid-left (approx 9:00)
    battery: 89,
    walkieChannel: 'Canal 1 (VIP)',
    location: 'Salon d’Honneur — Bar à Champagne',
    currentTask: 'Échanges conviviaux avec la famille élargie',
    pendingTasks: [
      'Discours du père de la mariée (prévu début de dîner)',
      'Projection surprise préparée par les témoins (22:45)'
    ],
    phone: '+33 6 23 45 67 89'
  },
  {
    id: 'traiteur-left',
    name: 'Traiteur',
    subtitle: 'Maison Gauthier — Cuisine Principale',
    role: 'Chef Exécutif & Équipe Chaude',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80',
    status: 'DELAY',
    statusColor: '#ef4444',
    ringColor: '#ef4444',
    badgeText: 'DELAY',
    badgeBg: 'rgba(127, 29, 29, 0.85)',
    badgeTextColor: '#fca5a5',
    angle: 220, // bottom-left (approx 7:30)
    battery: 92,
    walkieChannel: 'Canal 3 (Restauration)',
    location: 'Office Traiteur — Cuisine Bâtiment A',
    currentTask: 'Dressage des entrées — Décalage de 12 min suite au rallongement du cocktail',
    pendingTasks: [
      'Envoi des entrées à table (21:42)',
      'Cuisson minute des filets de bar et suprêmes (22:20)',
      'Service de la pièce montée & cascade (23:45)'
    ],
    alertMessage: 'Glissement de +12 min : Four N°2 réétalonné, dressage final en cours.',
    phone: '+33 6 45 67 89 01'
  },
  {
    id: 'piah-dars',
    name: 'Piah, Dars',
    subtitle: 'Officiant & Témoin Cérémonie',
    role: 'Animation & Rituels',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
    status: 'NORMAL',
    statusColor: '#4ade80',
    ringColor: '#4ade80',
    angle: 102, // top-center-left (~11:00)
    distanceFactor: 0.95,
    battery: 84,
    walkieChannel: 'Canal 2 (Animation)',
    location: 'Pergola Ouest',
    currentTask: 'Préparation du blind-test de table pour le repas',
    pendingTasks: ['Lancement du diaporama souvenir (22:40)'],
    phone: '+33 6 56 78 90 12'
  },
  {
    id: 'caj',
    name: 'CaJ',
    subtitle: 'Clara & Julien (Témoins)',
    role: 'Témoins de Sophie & Alexandre',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80',
    status: 'NORMAL',
    statusColor: '#818cf8',
    ringColor: '#818cf8',
    angle: 78, // top-center-right (~1:00)
    distanceFactor: 0.95,
    battery: 76,
    walkieChannel: 'Canal 2 (Animation)',
    location: 'Espace Photobooth',
    currentTask: 'Collecte des messages du livre d’or audio',
    pendingTasks: ['Animation jeu des mariés (23:10)'],
    phone: '+33 6 67 89 01 23'
  },
  {
    id: 'traiteur-right',
    name: 'Traiteur',
    subtitle: 'Service Salle & Maître d’Hôtel',
    role: 'Direction du Service de Table',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80',
    status: 'DELAY',
    statusColor: '#ef4444',
    ringColor: '#ef4444',
    badgeText: 'DELAY',
    badgeBg: 'rgba(127, 29, 29, 0.85)',
    badgeTextColor: '#fca5a5',
    angle: 40, // top-right (approx 2:00)
    battery: 88,
    walkieChannel: 'Canal 3 (Restauration)',
    location: 'Grande Salle de Réception',
    currentTask: 'Mise en place des carafes et contrôle du plan de table',
    pendingTasks: [
      'Appel des convives à table (prévu 21:25 au lieu de 21:15)',
      'Débouchage du vin rouge carafe (21:35)',
      'Service pain & beurre gourmet'
    ],
    alertMessage: 'Synchronisation avec le Wedding Planner : Ouverture des portes de salle à 21:25.',
    phone: '+33 6 78 90 12 34'
  },
  {
    id: 'photographe',
    name: 'Photographe',
    subtitle: 'Lucas V. Photography & Drone',
    role: 'Capture Photo & Vidéo',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
    status: 'ADJUSTING',
    statusColor: '#f97316',
    ringColor: '#f97316',
    badgeText: 'ADJUSTING',
    badgeBg: 'rgba(124, 45, 18, 0.85)',
    badgeTextColor: '#fdba74',
    angle: 0, // mid-right (approx 3:00)
    battery: 65,
    walkieChannel: 'Canal 4 (Tech & Médias)',
    location: 'Jardins à la Française (Bassin des Nymphéas)',
    currentTask: 'Session portraits crépuscule des mariés prolongée (+8 min de lumière dorée)',
    pendingTasks: [
      'Photos de l’entrée des mariés dans la salle (21:42)',
      'Couverture des discours & réactions (22:15 - 23:00)',
      'Clichés étincelles magiques & gâteau (23:45)'
    ],
    alertMessage: 'A profité du décalage traiteur pour réaliser 30 photos crépusculaires exceptionnelles.',
    phone: '+33 6 89 01 23 45'
  },
  {
    id: 'dj',
    name: 'DJ',
    subtitle: 'DJ Marc — Pulse Live Sound',
    role: 'Régie Audio, Microphones & Lumières',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80',
    status: 'NORMAL',
    statusColor: '#a855f7',
    ringColor: '#a855f7',
    angle: 325, // bottom-right-upper (~4:00)
    battery: 100,
    walkieChannel: 'Canal 4 (Tech & Médias)',
    location: 'Régie Scène — Grande Salle',
    currentTask: 'Prolongation de la playlist Deep Lounge Cocktail & test des micros HF',
    pendingTasks: [
      'Jingle d’entrée des mariés (Morceau : Coldplay - A Sky Full of Stars)',
      'Fond sonore tamisé pour le service',
      'Lancement de l’Ouverture de Bal (Valse moderne + Medley Funk)'
    ],
    phone: '+33 6 90 12 34 56'
  },
  {
    id: 'wedding-planner',
    name: 'Wedding Planner',
    subtitle: 'Éléonore — Agence Étoile Dorée',
    role: 'Directrice de Régie Générale',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&auto=format&fit=crop&q=80',
    status: 'MONITORING',
    statusColor: '#f59e0b',
    ringColor: '#f59e0b',
    badgeText: 'MONITORING',
    badgeBg: 'rgba(120, 53, 15, 0.85)',
    badgeTextColor: '#fde68a',
    angle: 295, // bottom-right (approx 5:00)
    battery: 94,
    walkieChannel: 'Canal 1 (Direction)',
    location: 'Point de Coordination Central / Passerelle',
    currentTask: 'Arbitrage du glissement horaire et validation du timing d’entrée en salle',
    pendingTasks: [
      'Annonce microphone pour inviter les convives à rejoindre la salle (21:25)',
      'Vérification éclairage bougies sur les 14 tables',
      'Briefing témoins pour le discours N°1'
    ],
    alertMessage: 'Supervision active. Récupération prévue de 8 min sur le créneau du dessert.',
    phone: '+33 6 01 23 45 67'
  },
  {
    id: 'logistique',
    name: 'Coordination',
    subtitle: 'Assistant Régie & Logistique',
    role: 'Logistique & Sécurité',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80',
    status: 'NORMAL',
    statusColor: '#eab308',
    ringColor: '#eab308',
    angle: 270, // bottom center (6:00)
    distanceFactor: 0.92,
    battery: 81,
    walkieChannel: 'Canal 1 (Direction)',
    location: 'Entrée Domaine & Parkings',
    currentTask: 'Allumage des flambeaux extérieurs et chemin lumineux',
    pendingTasks: ['Accueil des invités de soirée (prévus à 23h30)'],
    phone: '+33 6 11 22 33 44'
  }
];

export const TIMELINE_PHASES: TimelinePhase[] = [
  {
    id: 'ceremonie',
    title: 'Cérémonie',
    status: 'Done',
    statusColor: 'green',
    startTime: '18:00',
    endTime: '19:30',
    targetDuration: '1h30',
    responsible: ['Mariés', 'Piah, Dars', 'Parents', 'Photographe'],
    description: 'Cérémonie laïque dans les jardins avec échange des vœux et rituels des rubans.',
    location: 'Parc Est — Arche Fleurie',
    delayMinutes: 0
  },
  {
    id: 'cocktail',
    title: 'Cocktail',
    status: 'Active',
    statusColor: 'blue',
    startTime: '19:30',
    endTime: '21:15',
    targetDuration: '1h45',
    responsible: ['Traiteur', 'DJ', 'Photographe', 'Wedding Planner'],
    description: 'Vin d’honneur, ateliers dégustation foie gras & huîtres, photos de groupes et coucher de soleil.',
    location: 'Terrasse du Château & Orangerie',
    delayMinutes: 12
  },
  {
    id: 'diner',
    title: 'Dîner',
    status: 'Upcoming',
    statusColor: 'amber',
    startTime: '21:30',
    endTime: '23:45',
    targetDuration: '2h15',
    responsible: ['Traiteur', 'Wedding Planner', 'DJ', 'Parents', 'CaJ'],
    description: 'Repas gastronomique à table, 3 discours de témoins et pièce montée.',
    location: 'Grande Galerie des Glaces',
    delayMinutes: 12
  }
];

export const SCENARIOS: WeddingScenario[] = [
  {
    id: 'scenario-delay',
    name: 'Scénario Actuel : Retard Traiteur',
    tagline: 'Glissement de +12 min absorbé par la réserve globale',
    stabilityPercent: 88,
    globalSlackMinutes: 12,
    currentTime: '21:15',
    activePhaseId: 'cocktail',
    hasCateringDelay: true,
    incidentNote: 'Le service des entrées glisse de 21h30 à 21h42 suite à la prolongation du cocktail et réglage cuisine.'
  },
  {
    id: 'scenario-perfect',
    name: 'Scénario Idéal : Synchronisation Parfaite',
    tagline: 'Toutes les équipes sont à l’heure exacte prévue au millimètre',
    stabilityPercent: 100,
    globalSlackMinutes: 25,
    currentTime: '21:15',
    activePhaseId: 'cocktail',
    hasCateringDelay: false,
    incidentNote: 'Aucun retard détecté. Début du dîner confirmé à 21h30 précises.'
  },
  {
    id: 'scenario-rain',
    name: 'Scénario Repli Pluie : Timing Express',
    tagline: 'Cocktail déplacé sous verrière, accélération du passage à table',
    stabilityPercent: 92,
    globalSlackMinutes: 5,
    currentTime: '21:15',
    activePhaseId: 'cocktail',
    hasCateringDelay: false,
    incidentNote: 'Repli réussi. Espace intérieur opérationnel à 100%.'
  },
  {
    id: 'scenario-surprise',
    name: 'Scénario Discours Émotion (+20 min)',
    tagline: 'Les discours des témoins durent plus longtemps que prévu',
    stabilityPercent: 79,
    globalSlackMinutes: 2,
    currentTime: '22:15',
    activePhaseId: 'diner',
    hasCateringDelay: true,
    incidentNote: 'Ajustement cuisson plat principal par le chef pour 22h40.'
  }
];

export const ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    time: '21:12',
    actor: 'Wedding Planner',
    actorRole: 'Direction Régie',
    message: 'Validation du glissement de +12 min. Appel en salle décalé à 21h25.',
    type: 'alert',
    badgeColor: 'amber'
  },
  {
    id: 'log-2',
    time: '21:08',
    actor: 'Traiteur Cuisine',
    actorRole: 'Chef Exécutif',
    message: 'Dressage des 140 entrées (Carpaccio de Saint-Jacques) prêt pour 21h40.',
    type: 'radio',
    badgeColor: 'red'
  },
  {
    id: 'log-3',
    time: '21:02',
    actor: 'Photographe',
    actorRole: 'Lucas V.',
    message: 'Session couple crépuscule terminée. Rendu incroyable avec le soleil couchant.',
    type: 'update',
    badgeColor: 'blue'
  },
  {
    id: 'log-4',
    time: '20:55',
    actor: 'DJ Marc',
    actorRole: 'Régie Son',
    message: 'Test micro HF N°1 et N°2 validé pour les discours en salle.',
    type: 'update',
    badgeColor: 'purple'
  },
  {
    id: 'log-5',
    time: '19:30',
    actor: 'Piah, Dars',
    actorRole: 'Officiant',
    message: 'Clôture de la Cérémonie Laïque — Sortie sous pluie de pétales réussie à 100%.',
    type: 'milestone',
    badgeColor: 'green'
  }
];

export const RUNNING_ORDER_CUES: CueItem[] = [
  {
    id: 'cue-1',
    time: '18:00',
    phase: 'Cérémonie',
    title: 'Installation des invités & Entrée du Cortège',
    owner: 'Wedding Planner & DJ',
    location: 'Parc Est',
    status: 'terminee',
    musicCue: 'Pachelbel Canon en Ré (Version Cordes)',
    notes: 'Placement impeccable, météo 24°C idéale.'
  },
  {
    id: 'cue-2',
    time: '18:15',
    phase: 'Cérémonie',
    title: 'Échange des Vœux & Alliances',
    owner: 'Alexandre, Sophie & Témoins',
    location: 'Parc Est',
    status: 'terminee',
    musicCue: 'Ambiance acoustique douce',
    notes: 'Moment très émouvant, micros HF sans parasite.'
  },
  {
    id: 'cue-3',
    time: '19:30',
    phase: 'Cocktail',
    title: 'Ouverture du Cocktail & Sabrage Champagne',
    owner: 'Traiteur & Parents',
    location: 'Terrasse du Château',
    status: 'terminee',
    musicCue: 'Jazz Lounge & Bossa Nova Live',
    notes: 'Buffet chaud et huîtres très appréciés.'
  },
  {
    id: 'cue-4',
    time: '20:45',
    phase: 'Cocktail',
    title: 'Photos de Groupes & Portraits de Couple',
    owner: 'Photographe & Mariés',
    location: 'Bassin des Nymphéas',
    status: 'en_cours',
    musicCue: 'Playlist Sunset Lounge',
    notes: 'Prolongation de 8 min pour capturer la golden hour.'
  },
  {
    id: 'cue-5',
    time: '21:15',
    phase: 'Cocktail / Dîner',
    title: 'Détection du Retard Traiteur & Régulation (+12 min)',
    owner: 'Wedding Planner & Chef Traiteur',
    location: 'Office Traiteur & Salle',
    status: 'alerte',
    notes: 'Appel en salle repoussé à 21h25, entrée des mariés à 21h42.'
  },
  {
    id: 'cue-6',
    time: '21:42',
    phase: 'Dîner',
    title: 'Entrée Triomphale des Mariés dans la Grande Salle',
    owner: 'DJ, Mariés & Wedding Planner',
    location: 'Grande Galerie',
    status: 'a_venir',
    musicCue: 'Coldplay - A Sky Full of Stars (Drop à 0:45)',
    lightingCue: 'Jeu de lyres dorées + faisceaux blancs',
    notes: 'Serviettes tournoyantes prévues par les témoins.'
  },
  {
    id: 'cue-7',
    time: '22:15',
    phase: 'Dîner',
    title: 'Premier Discours (Père de la Mariée)',
    owner: 'Parents & DJ (Micro 1)',
    location: 'Table d’Honneur',
    status: 'a_venir',
    notes: 'Durée maximale calibrée : 6 minutes.'
  },
  {
    id: 'cue-8',
    time: '23:45',
    phase: 'Dîner',
    title: 'Arrivée de la Pièce Montée & Fontaines Étincelles',
    owner: 'Traiteur, DJ & Photographe',
    location: 'Piste Centrale',
    status: 'a_venir',
    musicCue: 'Kygo - Firestone (Orchestral Drop)',
    lightingCue: 'Blackout + Étincelles froides Pyro 2m',
    notes: 'Découpe du gâteau et toast champagne.'
  },
  {
    id: 'cue-9',
    time: '00:00',
    phase: 'Soirée',
    title: 'Ouverture de Bal des Mariés',
    owner: 'Mariés & DJ',
    location: 'Piste de Danse',
    status: 'a_venir',
    musicCue: 'Ed Sheeran - Perfect (Transition Medley Funk 70s)',
    lightingCue: 'Fumée lourde au sol + Douche de lumière ambrée',
    notes: 'Lancement officiel du dancefloor jusqu’à 04h30.'
  }
];
