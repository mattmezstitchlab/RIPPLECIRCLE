import { NET_BY_ID } from './networking';

/*
 * Parcours renseigné par chaque personne (démonstration, données fictives).
 * Affiché au centre du cadran quand l'aiguille passe sur elle.
 */
export const GUEST_STORY: Record<string, string> = {
  n1: 'Ingénieur énergie passé par EDF, a fondé Kelvin en 2023 pour piloter la consommation des bâtiments tertiaires.',
  n2: '12 ans en fusions-acquisitions, a ouvert son cabinet pour accompagner les fondateurs dès leurs premiers statuts.',
  n3: 'Ancien dirigeant d’une PME tech revendue, investit aujourd’hui dans une quinzaine de startups deeptech.',
  n4: 'Formée à Belleville, spécialiste de la réhabilitation de patrimoine ancien en matériaux biosourcés.',
  n5: 'Troisième génération d’une agence familiale, a développé le conseil en investissement locatif.',
  n6: 'Passée par L’Oréal puis une maison de cosmétiques indépendante, pilote aujourd’hui ses lancements.',
  n7: 'Formé chez un étoilé lyonnais, a ouvert son comptoir de quartier en 2021, complet tous les soirs.',
  n8: 'Médecin de famille, veut créer une maison de santé pluridisciplinaire dans son quartier.',
  n9: 'A repris l’usine familiale de découpe métal, cherche à automatiser sans perdre ses savoir-faire.',
  n10: 'Directrice artistique indépendante, crée des identités visuelles pour des marques artisanales.',
  n11: 'Ex-cabinet de conseil international, accompagne désormais les ETI industrielles dans leur stratégie.',
  n12: 'A organisé plus de 300 événements privés et corporate, toujours à la recherche de lieux singuliers.',
  n13: 'Développeur depuis l’âge de 14 ans, construit une plateforme qui relie médecins et patients chroniques.',
  n14: 'Notaire associée, spécialiste des montages patrimoniaux et des sociétés civiles immobilières.',
  n15: 'Gère un fonds dédié à l’immobilier résidentiel, ancien analyste à Londres pendant huit ans.',
  n16: 'Photographe de mode puis de voyage, réalise aujourd’hui des campagnes pour des marques engagées.',
  n17: 'Promoteur de petites résidences à taille humaine, cherche des architectes pour ses projets bas carbone.',
  n18: 'Kinésithérapeute du sport, accompagne un club de rugby et souhaite ouvrir son propre cabinet.',
  n19: 'A fait grandir trois startups de 0 à 1 million d’utilisateurs, conseille maintenant des fondateurs.',
  n20: 'Ancienne cheffe de rang, a ouvert un bistrot de saison qui accueille déjà des mariages intimistes.',
  n21: 'Ingénieur aéronautique, travaille sur des matériaux légers et cherche des startups partenaires.',
  n22: 'Conseille les industriels sur leur bilan carbone et leur stratégie de décarbonation.',
  n23: 'Scénographe de théâtre devenu designer d’événements, imagine des décors immersifs.',
  n24: 'Dirige un château événementiel de 40 hectares, programme mariages, séminaires et festivals.',
  n25: 'Ancien cuisinier devenu entrepreneur, développe une application anti-gaspillage pour les restaurants.',
  n26: 'Banquière privée depuis 15 ans, accompagne les entrepreneurs dans la cession et la transmission.',
  n27: 'Designer d’intérieur pour l’hôtellerie et la restauration, signe des lieux chaleureux et durables.',
  n28: 'Fiscaliste, conseille dirigeants et investisseurs sur l’optimisation de leurs opérations.',
  n29: 'Titulaire d’une officine depuis dix ans, envisage d’en racheter une seconde.',
  n30: 'DJ et producteur, joue en club et en mariage, compose aussi pour des marques.',
  n31: 'Dirige une filature familiale relancée autour du textile français et responsable.',
  n32: 'Banquier d’affaires passé en conseil indépendant, accompagne cessions et rapprochements.',
  't-maries':
    'Rencontrés en 2019 lors d’un voyage à Lisbonne, ils ont imaginé une soirée où chaque invité repart avec une rencontre qui compte.',
  't-temoins': 'Amis d’enfance des mariés, ils préparent depuis six mois une projection surprise et le jeu des mariés.',
  't-traiteur':
    'Formée dans de grandes maisons lyonnaises, Mathilde dirige Maison Gauthier depuis 2015 et sert une soixantaine de mariages par an.',
  't-photo': 'Photographe de mariage depuis dix ans, Lucas filme aussi au drone et développe des campagnes pour les marques.',
  't-dj': 'Résident en club pendant huit ans, Marc a fondé Pulse Live Sound : mariages, festivals et soirées d’entreprise.',
  't-planner':
    'Ancienne cheffe de projet événementiel, Éléonore a fondé Étoile Dorée et orchestre une trentaine de mariages par an.'
};

/** Photo de profil : celle de l'équipe si connue, sinon un portrait fictif (service d'avatars public). */
export const guestPhoto = (id: string) => {
  const photo = NET_BY_ID[id]?.photo;
  if (photo) return photo;
  const n = Number(id.replace(/\D/g, '')) || 1;
  return `https://i.pravatar.cc/240?img=${((n * 7) % 70) + 1}`;
};
