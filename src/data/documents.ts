export type DocKind = 'contrat' | 'devis' | 'facture' | 'fiche' | 'checklist' | 'note';
export type DocStatus = 'signé' | 'à signer' | 'validé' | 'brouillon' | 'payée';

export interface DocLine {
  label: string;
  qty: number;
  unit: string;
  priceHT: number;
}

export interface Party {
  name: string;
  address: string;
  contact: string;
  siret: string;
}

export interface DocItem {
  id: string;
  title: string;
  kind: DocKind;
  status: DocStatus;
  updated: string;
  /** Référence du document (devis, facture, contrat…). */
  number: string;
  summary: string;
  date: string;
  from?: Party;
  to?: Party;
  lines?: DocLine[];
  vatRate?: number;
  /** Pourcentage déjà réglé (acompte ou paiement partiel). */
  paid?: number;
  dueDate?: string;
  validity?: string;
  paymentTerms?: string;
  clauses?: { title: string; body: string }[];
  specs?: { label: string; value: string }[];
  body: string[];
  checklist?: string[];
}

const DOMAINE: Party = {
  name: 'Domaine de Chantilly',
  address: '12 avenue du Parc, 60500 Chantilly',
  contact: 'reception@domaine-chantilly.fr · 03 44 27 18 90',
  siret: '414 208 337 00019'
};

const GOUTHIER: Party = {
  name: 'Maison Gauthier Traiteur',
  address: '7 rue des Artisans, 60260 Lamorlaye',
  contact: 'contact@maison-gauthier.fr · 03 44 65 22 10',
  siret: '802 114 556 00027'
};

const PULSE: Party = {
  name: 'Pulse Live Sound — DJ Marc',
  address: '24 rue de la Musique, 95000 Cergy',
  contact: 'marc@pulse-live.fr · 06 90 12 34 56',
  siret: '823 771 004 00042'
};

const LUCAS: Party = {
  name: 'Lucas V. Photography',
  address: '5 place du Marché, 60300 Senlis',
  contact: 'lucas@lucasvphoto.fr · 06 89 01 23 45',
  siret: '811 452 190 00033'
};

const ETOILE: Party = {
  name: 'Agence Étoile Dorée',
  address: '18 rue des Hortensias, 60260 Lamorlaye',
  contact: 'eleonore@etoiledoree.fr · 06 01 23 45 67',
  siret: '809 336 771 00058'
};

const COUPLE: Party = {
  name: 'Alexandre Moreau & Sophie Laurent',
  address: '31 rue des Lilas, 60200 Compiègne',
  contact: 'alexandre.sophie@mariage.fr · 06 12 34 56 78',
  siret: ''
};

const TVA = 20;

/** Dossiers documentaires par rôle (clés = ids de ROLES). */
export const DOCS: Record<string, DocItem[]> = {
  maries: [
    {
      id: 'm-devis',
      title: 'Devis — Réception complète',
      kind: 'devis',
      status: 'validé',
      updated: '12 sept.',
      number: 'D-2026-014',
      date: '12 septembre 2026',
      validity: '90 jours',
      from: DOMAINE,
      to: COUPLE,
      summary: 'Location des espaces, cocktail et dîner pour 94 convives',
      lines: [
        { label: 'Location de la Grande Galerie des Glaces (soirée)', qty: 1, unit: 'forfait', priceHT: 8400 },
        { label: 'Location de la Terrasse et de l’Orangerie (cocktail)', qty: 1, unit: 'forfait', priceHT: 3200 },
        { label: 'Cocktail — 94 convives', qty: 94, unit: 'pers.', priceHT: 42 },
        { label: 'Dîner assis — 94 convives', qty: 94, unit: 'pers.', priceHT: 88 },
        { label: 'Pièce montée et fontaine de chocolat', qty: 1, unit: 'forfait', priceHT: 940 },
        { label: 'Mobilier, nappage et vaisselle', qty: 1, unit: 'forfait', priceHT: 1250 }
      ],
      vatRate: TVA,
      paid: 30,
      dueDate: '9 octobre 2026',
      paymentTerms: 'Acompte de 30 % à la commande, solde à 9 octobre 2026.',
      body: [
        'Devis valable 90 jours, hors options. Capacité maximale autorisée : 120 personnes.',
        'Repli météo inclus sous la verrière sans supplément.'
      ],
      checklist: ['Valider la clause météo', 'Vérifier le nombre de convives', 'Retourner le devis signé']
    },
    {
      id: 'm-contrat',
      title: 'Contrat de réception — Domaine de Chantilly',
      kind: 'contrat',
      status: 'à signer',
      updated: '12 sept.',
      number: 'C-2026-014',
      date: '12 septembre 2026',
      from: DOMAINE,
      to: COUPLE,
      summary: 'Location des espaces, cocktail et dîner, samedi 11 octobre 2026',
      clauses: [
        {
          title: 'Article 1 — Objet',
          body:
            'Le Domaine met à disposition la Grande Galerie des Glaces, la Terrasse et l’Orangerie le samedi 11 octobre 2026 de 16h00 à 05h00, pour une réception de 94 convives maximum.'
        },
        {
          title: 'Article 2 — Prix et modalités',
          body:
            'Le montant total est de 31 212,00 € TTC, TVA 20 % incluse. Un acompte de 30 % (9 363,60 €) est versé à la signature, le solde au plus tard le 9 octobre 2026.'
        },
        {
          title: 'Article 3 — Repli météo',
          body:
            'En cas d’intempéries, la réception est transférée sous la verrière sans frais supplémentaires. Le Domaine informe les clients au plus tard 48 heures avant l’événement.'
        },
        {
          title: 'Article 4 — Annulation',
          body:
            'Toute annulation à plus de 60 jours de l’événement entraîne le remboursement de l’acompte, déduction faite de 15 % de frais de dossier. Au-delà, l’acompte reste acquis au Domaine.'
        },
        {
          title: 'Article 5 — Assurances',
          body:
            'Les clients fournissent une attestation de responsabilité civile couvrant l’événement au plus tard 7 jours avant la date.'
        },
        {
          title: 'Article 6 — Litiges',
          body:
            'Le présent contrat est soumis au droit français. Tout litige sera porté devant le tribunal de Senlis.'
        }
      ],
      body: ['Contrat en deux exemplaires, à retourner signé et accompagné de l’acompte.'],
      checklist: ['Relire les annexes techniques', 'Joindre l’attestation d’assurance', 'Signer les deux exemplaires']
    },
    {
      id: 'm-timing',
      title: 'Fiche technique — Déroulé de la soirée',
      kind: 'fiche',
      status: 'validé',
      updated: '3 oct.',
      number: 'FT-2026-001',
      date: '3 octobre 2026',
      from: DOMAINE,
      to: COUPLE,
      summary: 'Minute par minute, de la cérémonie à l’ouverture de bal',
      specs: [
        { label: 'Cérémonie laïque', value: '18:00 → 19:30 · Parc Est' },
        { label: 'Cocktail', value: '19:30 → 21:15 · Terrasse du Château' },
        { label: 'Passage à table', value: '21:25 · appel au micro' },
        { label: 'Entrée des mariés', value: '21:42 · jingle Coldplay' },
        { label: 'Discours', value: '22:15 → 23:00 · micros HF 1 et 2' },
        { label: 'Pièce montée', value: '23:45 · étincelles froides 2 m' },
        { label: 'Ouverture de bal', value: '00:00 · transition medley funk' },
        { label: 'Fin de la réception', value: '05:00' }
      ],
      body: ['Fiche remise à tous les prestataires, à jour après chaque répétition.'],
      checklist: ['Vérifier l’ordre des discours', 'Confirmer les temps de cuisson', 'Transmettre au DJ']
    },
    {
      id: 'm-checklist',
      title: 'Checklist J-1',
      kind: 'checklist',
      status: 'brouillon',
      updated: '8 oct.',
      number: 'CK-2026-001',
      date: '8 octobre 2026',
      summary: 'Tout ce qu’il reste à faire la veille',
      body: ['Récupérez les alliances au coffre et confiez-les à la témoin.'],
      checklist: [
        'Confirmer les 3 fournisseurs de fleurs',
        'Remettre le programme au DJ',
        'Préparer les enveloppes prestataires',
        'Déposer la tenue au pressing de salle'
      ]
    }
  ],
  temoin: [
    {
      id: 't-discours',
      title: 'Note de service — Discours des témoins',
      kind: 'note',
      status: 'brouillon',
      updated: '5 oct.',
      number: 'NS-2026-011',
      date: '5 octobre 2026',
      summary: 'Durée cible 5 min 40, micro HF 1',
      specs: [
        { label: 'Horaire', value: '22:15, après l’entrée en salle' },
        { label: 'Micro', value: 'HF 1 — tenu par le chef de salle' },
        { label: 'Durée maximale', value: '6 minutes' },
        { label: 'Enchaînement', value: 'Père de la mariée, puis les témoins' }
      ],
      body: [
        'Ouverture : anecdote de la rencontre (1 min)',
        'Souvenirs de la préparation du mariage (3 min)',
        'Toast final avec les invités (1 min)'
      ],
      checklist: ['Relire le texte à voix haute', 'Envoyer la version finale à la régie']
    },
    {
      id: 't-missions',
      title: 'Fiche technique — Missions des témoins',
      kind: 'fiche',
      status: 'validé',
      updated: '2 oct.',
      number: 'FT-2026-004',
      date: '2 octobre 2026',
      summary: 'Accueil, projection surprise, jeu des mariés',
      specs: [
        { label: 'Livre d’or audio', value: '19:30 → 22:00 · hall d’entrée' },
        { label: 'Projection surprise', value: '22:45 · écran fond de scène, 4 min 20' },
        { label: 'Jeu des mariés', value: '23:10 · piste centrale' }
      ],
      body: ['La projection est lancée sur le signal « lumière dorée » donné par le DJ.'],
      checklist: ['Charger la clé USB de projection', 'Briefer le DJ sur le signal', 'Récupérer les messages audio']
    }
  ],
  traiteur: [
    {
      id: 'tr-devis',
      title: 'Devis — Prestation traiteur',
      kind: 'devis',
      status: 'validé',
      updated: '10 sept.',
      number: 'D-2026-031',
      date: '10 septembre 2026',
      validity: '60 jours',
      from: GOUTHIER,
      to: COUPLE,
      summary: 'Cocktail et dîner assis, 94 convives',
      lines: [
        { label: 'Cocktail — huîtres, foie gras, pièces sucrées', qty: 94, unit: 'pers.', priceHT: 46 },
        { label: 'Entrée — carpaccio de Saint-Jacques', qty: 94, unit: 'pers.', priceHT: 24 },
        { label: 'Plat — filet de bar ou suprême de volaille', qty: 94, unit: 'pers.', priceHT: 38 },
        { label: 'Dessert — pièce montée et fontaine', qty: 94, unit: 'pers.', priceHT: 18 },
        { label: 'Personnel de service (12 personnes)', qty: 12, unit: 'pers.', priceHT: 210 },
        { label: 'Location de vaisselle et verrerie', qty: 1, unit: 'forfait', priceHT: 780 }
      ],
      vatRate: TVA,
      paid: 40,
      dueDate: '9 octobre 2026',
      paymentTerms: 'Acompte de 40 % à la commande, solde à 9 octobre 2026.',
      body: ['Devis valable 60 jours. Régimes particuliers pris en charge sans supplément.'],
      checklist: ['Confirmer les régimes alimentaires', 'Valider les heures de service', 'Retourner signé']
    },
    {
      id: 'tr-contrat',
      title: 'Contrat de prestation traiteur',
      kind: 'contrat',
      status: 'signé',
      updated: '18 sept.',
      number: 'C-2026-031',
      date: '18 septembre 2026',
      from: GOUTHIER,
      to: COUPLE,
      summary: 'Cocktail et dîner assis, samedi 11 octobre 2026',
      clauses: [
        {
          title: 'Article 1 — Prestation',
          body:
            'La Maison Gauthier assure le cocktail et le dîner assis pour 94 convives, hors boissons alcoolisées qui restent à la charge du Domaine.'
        },
        {
          title: 'Article 2 — Horaires',
          body:
            'Service du cocktail de 19h30 à 21h15. Service des entrées à 21h42, plat à 22h20, dessert à 23h45.'
        },
        {
          title: 'Article 3 — Régimes alimentaires',
          body:
            '9 couverts végétariens, 6 sans gluten, 2 halal et 3 allergies aux fruits de mer sont pris en charge sans supplément.'
        },
        {
          title: 'Article 4 — Retard et ajustement',
          body:
            'En cas de glissement horaire supérieur à 15 minutes, le prestataire ajuste la cuisson du plat principal pour maintenir le service à 22h20.'
        },
        {
          title: 'Article 5 — Rémunération',
          body:
            'Le montant total s’élève à 18 172,80 € TTC. Un acompte de 40 % (7 269,12 €) a été versé, le solde de 10 903,68 € est dû au 9 octobre 2026.'
        }
      ],
      body: ['Contrat signé par les deux parties le 18 septembre 2026.'],
      checklist: ['Archiver l’acompte', 'Confirmer le plan de salle']
    },
    {
      id: 'tr-fiche',
      title: 'Fiche technique de service',
      kind: 'fiche',
      status: 'validé',
      updated: '1 oct.',
      number: 'FT-2026-031',
      date: '1 octobre 2026',
      from: GOUTHIER,
      to: COUPLE,
      summary: '140 entrées, plat, pièce montée',
      specs: [
        { label: 'Effectif', value: '12 personnes dont 1 chef de rang' },
        { label: 'Entrée', value: 'Carpaccio de Saint-Jacques — 21:42' },
        { label: 'Plat', value: 'Filet de bar ou suprême — 22:20' },
        { label: 'Dessert', value: 'Pièce montée 3 étages — 23:45' },
        { label: 'Régimes', value: 'Végétarien 9 · Sans gluten 6 · Halal 2 · Fruits de mer 3' },
        { label: 'Logistique', value: 'Office traiteur, Bâtiment A — accès 15h00' }
      ],
      body: ['Dressage par vagues de 40 assiettes pour tenir le décalage de 12 minutes.'],
      checklist: ['Prévenir la régie à chaque vague', 'Ajuster la cuisson du plat à 22:20']
    },
    {
      id: 'tr-facture',
      title: 'Facture d’acompte',
      kind: 'facture',
      status: 'payée',
      updated: '18 sept.',
      number: 'F-2026-031',
      date: '18 septembre 2026',
      dueDate: '18 septembre 2026',
      from: GOUTHIER,
      to: COUPLE,
      summary: 'Acompte de 40 % sur la prestation traiteur',
      lines: [
        { label: 'Acompte 40 % — contrat C-2026-031', qty: 1, unit: 'forfait', priceHT: 6057.6 }
      ],
      vatRate: TVA,
      paid: 100,
      paymentTerms: 'Facture acquittée. Solde de 10 903,68 € TTC à régler au 9 octobre 2026.',
      body: ['Facture réglée par virement le 18 septembre 2026.'],
      checklist: []
    }
  ],
  photographe: [
    {
      id: 'p-contrat',
      title: 'Contrat de prestation photographique',
      kind: 'contrat',
      status: 'signé',
      updated: '20 juil.',
      number: 'C-2026-052',
      date: '20 juillet 2026',
      from: LUCAS,
      to: COUPLE,
      summary: 'Couverture complète du mariage, livraison sous 6 semaines',
      clauses: [
        {
          title: 'Article 1 — Prestation',
          body:
            'Couverture photographique de la journée complète, de 17h00 à 01h00, par un photographe principal et un assistant.'
        },
        {
          title: 'Article 2 — Livraison',
          body:
            '120 photographies retouchées en haute résolution livrées sous 6 semaines, plus un lot de 300 fichiers bruts triés.'
        },
        {
          title: 'Article 3 — Droits d’auteur',
          body:
            'Cession des droits d’usage privé et de diffusion sur les réseaux sociaux. Toute utilisation commerciale reste interdite sans accord écrit.'
        },
        {
          title: 'Article 4 — Drone',
          body:
            'Vol autorisé dans les jardins Est uniquement, hors cérémonie, sous couvert de l’autorisation préfectorale A-2026-114.'
        },
        {
          title: 'Article 5 — Rémunération',
          body: 'Le montant total s’élève à 6 384,00 € TTC, acompte de 50 % versé à la signature.'
        }
      ],
      body: ['Contrat signé le 20 juillet 2026.'],
      checklist: ['Autorisation drone jointe', 'Attestation d’assurance jointe']
    },
    {
      id: 'p-shotlist',
      title: 'Fiche technique — Liste de shots prioritaires',
      kind: 'fiche',
      status: 'validé',
      updated: '6 oct.',
      number: 'FT-2026-052',
      date: '6 octobre 2026',
      from: LUCAS,
      to: COUPLE,
      summary: 'Portraits, entrée en salle, réactions',
      specs: [
        { label: 'Portraits couple', value: '20:45 → 21:15 · bassin des nymphéas' },
        { label: 'Famille proche', value: '19:45 → 20:15 · terrasse' },
        { label: 'Entrée en salle', value: '21:42 · 2 positions : escalier et face piste' },
        { label: 'Réactions', value: '22:15 → 23:00 · tables 1 à 6' },
        { label: 'Pièce montée', value: '23:45 · ISO 1600' },
        { label: 'Premiers pas', value: '00:00 · longue exposition' }
      ],
      body: ['Matériel : 2 boîtiers, 24-70 mm f/2.8 et 70-200 mm f/2.8.'],
      checklist: ['Portraits couple (20 min)', 'Famille proche (15 min)', 'Pièce montée & étincelles', 'Premiers pas']
    },
    {
      id: 'p-facture',
      title: 'Facture d’acompte',
      kind: 'facture',
      status: 'payée',
      updated: '20 juil.',
      number: 'F-2026-052',
      date: '20 juillet 2026',
      dueDate: '20 juillet 2026',
      from: LUCAS,
      to: COUPLE,
      summary: 'Acompte de 30 % sur la prestation',
      lines: [{ label: 'Acompte 30 % — contrat C-2026-052', qty: 1, unit: 'forfait', priceHT: 840 }],
      vatRate: TVA,
      paid: 100,
      paymentTerms: 'Facture acquittée. Solde de 2 352,00 € TTC à la livraison des fichiers.',
      body: ['Facture réglée par virement le 20 juillet 2026.'],
      checklist: []
    }
  ],
  dj: [
    {
      id: 'dj-devis',
      title: 'Devis — Prestation DJ et sonorisation',
      kind: 'devis',
      status: 'validé',
      updated: '5 sept.',
      number: 'D-2026-077',
      date: '5 septembre 2026',
      validity: '45 jours',
      from: PULSE,
      to: COUPLE,
      summary: 'Animation musicale de 19h00 à 04h30, son et lumière',
      lines: [
        { label: 'Animation DJ — 9 h 30 de prestation', qty: 9.5, unit: 'h', priceHT: 130 },
        { label: 'Sonorisation principale et retours', qty: 1, unit: 'forfait', priceHT: 420 },
        { label: 'Micros HF (4 unités)', qty: 4, unit: 'unités', priceHT: 45 },
        { label: 'Jeu de lyres dorées et faisceaux', qty: 1, unit: 'forfait', priceHT: 380 },
        { label: 'Pyrotechnie froide 2 m', qty: 1, unit: 'forfait', priceHT: 260 }
      ],
      vatRate: TVA,
      paid: 30,
      dueDate: '9 octobre 2026',
      paymentTerms: 'Acompte de 30 % à la commande, solde le jour de l’événement.',
      body: ['Devis valable 45 jours. Repérage technique offert 2 semaines avant.'],
      checklist: ['Valider la cue sheet', 'Confirmer les morceaux d’entrée']
    },
    {
      id: 'dj-cue',
      title: 'Fiche technique — Cue sheet',
      kind: 'fiche',
      status: 'validé',
      updated: '2 oct.',
      number: 'FT-2026-077',
      date: '2 octobre 2026',
      from: PULSE,
      to: COUPLE,
      summary: 'Morceaux et drops, minute par minute',
      specs: [
        { label: '18:00', value: 'Pachelbel, Canon en Ré — cérémonie' },
        { label: '19:30', value: 'Jazz lounge et bossa nova live — cocktail' },
        { label: '21:42', value: 'Coldplay, A Sky Full of Stars — drop à 0:45' },
        { label: '22:15', value: 'Fond sonore −15 dB sous les discours' },
        { label: '23:45', value: 'Kygo, Firestone — orchestral drop' },
        { label: '00:00', value: 'Ed Sheeran, Perfect → medley funk 70s' }
      ],
      body: ['Signaux de lumière convenus avec la régie : doré = projection, blanc = entrée.'],
      checklist: ['Tester les micros HF', 'Caler les niveaux de la salle']
    }
  ],
  invite: [
    {
      id: 'i-pratique',
      title: 'Fiche pratique — Invités',
      kind: 'fiche',
      status: 'validé',
      updated: '—',
      number: 'FT-2026-100',
      date: '4 octobre 2026',
      summary: 'Accès, navettes, parking',
      specs: [
        { label: 'Adresse', value: 'Domaine de Chantilly, entrée Sud' },
        { label: 'Cérémonie', value: '18:00 · Parc Est' },
        { label: 'Cocktail', value: '19:30 · Terrasse du Château' },
        { label: 'Dîner', value: '21:45 · Grande Galerie' },
        { label: 'Navettes', value: 'Départs à 17:30 et 23h30 depuis la gare' },
        { label: 'Parking', value: '200 places, voituriers à l’entrée' },
        { label: 'Code vestiaire', value: 'Tenue de soirée' }
      ],
      body: ['Merci de prévenir la régie de tout régime alimentaire particulier.'],
      checklist: ['Confirmer votre navette retour', 'Indiquer vos allergies']
    },
    {
      id: 'i-menu',
      title: 'Fiche technique — Menu du dîner',
      kind: 'fiche',
      status: 'validé',
      updated: '4 oct.',
      number: 'FT-2026-101',
      date: '4 octobre 2026',
      summary: 'Entrée, plat, dessert',
      specs: [
        { label: 'Entrée', value: 'Carpaccio de Saint-Jacques, huile de citron' },
        { label: 'Plat', value: 'Filet de bar en croûte ou suprême de volaille' },
        { label: 'Accompagnement', value: 'Légumes de saison, écrasé de pommes de terre' },
        { label: 'Fromage', value: 'Assiette de fromages affinés' },
        { label: 'Dessert', value: 'Pièce montée et fontaine de chocolat' },
        { label: 'Vins', value: 'Chablis, Côtes-du-Rhône, Champagne au toast' }
      ],
      body: ['Options végétariennes et sans gluten disponibles sur demande à l’inscription.'],
      checklist: []
    }
  ],
  planner: [
    {
      id: 'pl-devis',
      title: 'Devis — Honoraires de coordination',
      kind: 'devis',
      status: 'validé',
      updated: '2 sept.',
      number: 'D-2026-002',
      date: '2 septembre 2026',
      validity: '30 jours',
      from: ETOILE,
      to: COUPLE,
      summary: 'Coordination complète, du premier repérage au jour J',
      lines: [
        { label: 'Coordination et planification (6 mois)', qty: 6, unit: 'mois', priceHT: 380 },
        { label: 'Repérages sur site', qty: 4, unit: 'visites', priceHT: 250 },
        { label: 'Jour J — direction de régie (12 h)', qty: 12, unit: 'h', priceHT: 120 },
        { label: 'Gestion des prestataires et paiements', qty: 1, unit: 'forfait', priceHT: 600 }
      ],
      vatRate: TVA,
      paid: 50,
      dueDate: '9 octobre 2026',
      paymentTerms: 'Acompte de 50 % à la signature, solde à 9 octobre 2026.',
      body: ['Devis valable 30 jours. Nombre de prestataires suivis : 9.'],
      checklist: ['Valider le rétroplanning', 'Confirmer le budget']
    },
    {
      id: 'pl-facture',
      title: 'Facture — Solde des honoraires',
      kind: 'facture',
      status: 'à signer',
      updated: '10 oct.',
      number: 'F-2026-002',
      date: '10 octobre 2026',
      dueDate: '20 octobre 2026',
      from: ETOILE,
      to: COUPLE,
      summary: 'Solde de 50 % sur les honoraires de coordination',
      lines: [{ label: 'Solde 50 % — devis D-2026-002', qty: 1, unit: 'forfait', priceHT: 2660 }],
      vatRate: TVA,
      paid: 0,
      paymentTerms: 'Règlement par virement à 30 jours date de facture.',
      body: ['Facture émise après la tenue de la régie du 11 octobre 2026.'],
      checklist: []
    },
    {
      id: 'pl-retro',
      title: 'Fiche technique — Rétroplanning J-90',
      kind: 'fiche',
      status: 'validé',
      updated: '1 sept.',
      number: 'FT-2026-002',
      date: '1er septembre 2026',
      summary: 'Jalons clés avant le jour J',
      specs: [
        { label: 'J-90', value: 'Contrats signés, budget arrêté' },
        { label: 'J-60', value: 'Plan de table première version' },
        { label: 'J-30', value: 'Plan de table figé, menus validés' },
        { label: 'J-14', value: 'Relance fournisseurs, confirmations' },
        { label: 'J-7', value: 'Briefing prestataires' },
        { label: 'J-2', value: 'Répétition de la cérémonie' },
        { label: 'J0', value: 'Régie ouverte à 15h00' }
      ],
      body: ['Chaque jalon fait l’objet d’un point de validation avec les mariés.'],
      checklist: ['Relance fournisseurs à J-14', 'Répétition cérémonie à J-2']
    }
  ]
};

/** Libellé lisible du type de document. */
export const DOC_KIND_LABEL: Record<DocKind, string> = {
  contrat: 'Contrat',
  devis: 'Devis',
  facture: 'Facture',
  fiche: 'Fiche technique',
  checklist: 'Checklist',
  note: 'Note'
};

/** Un document commercial porte des lignes et des totaux. */
export const isCommercial = (d: DocItem) => !!d.lines && d.lines.length > 0;

export interface Totals {
  ht: number;
  vat: number;
  ttc: number;
  paid: number;
  due: number;
}

export function totalsOf(d: DocItem): Totals {
  const lines = d.lines ?? [];
  const ht = lines.reduce((s, l) => s + l.qty * l.priceHT, 0);
  const vat = (ht * (d.vatRate ?? TVA)) / 100;
  const ttc = ht + vat;
  const paid = (ttc * (d.paid ?? 0)) / 100;
  return { ht, vat, ttc, paid, due: ttc - paid };
}

export const euro = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
