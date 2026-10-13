# RIPPLECIRCLE — Cadran vivant 2D

RIPPLECIRCLE propose **un cercle interactif en SVG 2D**, organisé en anneaux. Le cercle constitue désormais **l'unique interface de visualisation** : pas de moteur 3D, de scène WebGL ou de navigation entre deux modèles.

## Explorer le cadran

- **Calendrier** : repères de préparation.
- **Parcours** : étapes de vie.
- **Jour J** : moments et programme.
- **Memory** : photos et souvenirs.
- **Playlist** : titres, créneaux, couleurs de séquence et signaux associés aux moments.
- **Plan de tables** : personnes, groupes et relations.
- **Compte** : profil et préférences.

Le cercle conserve le zoom, le déplacement, la sélection d'éléments, les couleurs de couches, le thème clair unique, les portraits contextuels en colonne droite et les indicateurs d'orchestration.

**Musique :** la playlist est un **conducteur temporel**, avec une couleur par séquence (cérémonie, cocktail, transition, dîner, soirée). Les effets sonores de l'interface sont produits via Web Audio et peuvent être coupés. **La lecture audio des enregistrements musicaux n'est pas encore implémentée** ; la présence d'un titre dans la playlist ne signifie pas que le morceau est diffusé.

**Données :** démonstration côté navigateur, avec persistance locale. Les états d'orchestration sont simulés : pas de backend temps réel ni de synchronisation entre invités.

## Développement

```sh
npm ci
npm run dev
npm run test
npm run build
```

La source du cercle est `src/components/landing/Ripple.tsx`. La palette et les rayons sont dans `src/ripple/config.ts` ; la programmation des morceaux dans `src/data/playlist.ts` ; les effets sonores dans `src/utils/audio.ts`.

## Orientation du projet

1. **Une visualisation 2D unique** : simplifier la navigation et améliorer la lisibilité mobile.
2. **La musique comme repère de temps** : associer chaque morceau à un moment, puis ajouter ultérieurement des extraits autorisés avec états de lecture explicites.
3. **Les liens et conséquences** : faire ressortir les relations pertinentes lors d'une sélection, sans masquer les anneaux.
4. **Des données fiables** : distinguer clairement la simulation et les informations réellement confirmées.

Les anciennes versions 3D ont été retirées des sources actives. Elles restent consultables dans l'historique Git.

## V2 — musique et relations

Depuis **Playlist**, sélectionner un titre permet de charger **un fichier audio présent sur votre appareil**, puis d'écouter au maximum **30 secondes**. La forme de l'anneau musical réagit au niveau sonore analysé par le navigateur (si Web Audio est disponible). Le fichier reste local : aucun téléversement, sauvegarde ou recherche automatique de morceaux commerciaux. Le bouton « Couper les effets sonores » concerne uniquement les effets d'interface, pas le lecteur d'aperçu.

Depuis le cercle, le bouton « Relations » masque ou affiche les liaisons directes de la personne sélectionnée. Les connexions sont colorées par groupe, limitées à 14 traits pour rester lisibles et respectent la préférence « réduire les animations ».

La **régie simulée** est rangée dans un panneau repliable. La lecture d'un extrait musical ne modifie pas l'horloge de régie, les programmes ni les données enregistrées.

## Interface instrument (causalité d'abord)

- **Header sans navigation** : seule l'entrée Compte demeure ; le thème clair est fixe. Compte réunit Profil, RSVP, Parcours et Mes données.
- **Commandes rondes** : les vues sont accessibles autour du cadran, pas dans le header.
- **Un cadran centré** : diamètre limité par la hauteur de la fenêtre et les colonnes. Les aiguilles centrales suivent une horloge standard 12 heures (12 en haut, rotation horaire), tandis que l'aiguille rouge extérieure conserve l'axe temporel linéaire 15:00 → 05:00 du programme.
- **Colonne causale prioritaire** : synthèse cause → conséquences → plan B visible sans parcourir les panneaux ; sélection d'une personne ou d'un moment = informations uniques à droite.
- **Détails secondaires repliés** : temps de régie, simulateur d'actions, liste exhaustive ; aucune de ces vues n'est nécessaire pour comprendre le premier écran.
- **Démo explicite** : horloge de régie et causalité sont simulées, pas un événement réel.


## V3 — instrument temporel et scénarios publics

Le cadran est maintenant piloté par l’instant exploré de 15:00 à 05:00, via le cercle ou le curseur de la colonne latérale. Les titres musicaux et moments suivent cet instant, sans lire automatiquement des enregistrements. Le mode « suivre la régie » relie volontairement les deux horloges simulées. Un seul inspecteur contextuel décrit l'instant; les fiches détaillées et commandes historiques sont repliées.

Trois boutons principaux donnent accès à une **démonstration déterministe distincte du moteur confidentiel** : Simuler un imprévu, Trouver la première cause, Réparer le planning. Le retard fictif génère quatre décalages horaires dérivés de la chronologie statique, et trois plans fictifs classés sur un score explicite (retard restant, coût fictif et acteurs). Ces règles sont publiques, ne constituent pas un solveur de contraintes général, ne découvrent aucune causalité et ne déclenchent aucune action ni notification. Les liens cause-effet sont illustratifs et nommés comme tels.

Le noyau causal expérimental privé est **absent de ce dépôt**. Les actions et les données du simulateur public sont entièrement fictives.


## V4 — conséquences indirectes, actions, rejeu (public fictif)

Trois commandes compactes dans l'inspecteur ouvrent :
- **Impacts cachés** : parcours d'un petit graphe de huit dépendances fictives, avec profondeur et distinction entre lien du programme et hypothèse à vérifier (photos, lumière, transport, logistique).
- **Répartir les actions** : consignes brouillon par rôle dérivées du plan V3 sélectionné (ou du plan recommandé pour l’exemple). L’utilisateur peut marquer des consignes préparées **uniquement dans la session du navigateur** et copier le texte. Aucune transmission, adresse, intégration, sauvegarde ou notification.
- **Rejouer** : chronologie scénarisée avec lecteur manuel, progression, choix d'instants et comparaison référence / sans plan / option sélectionnée. Aucun journal réel ou preuve de résultat historique.

Ces capacités reposent exclusivement sur les modèles statiques publics `publicSimulation.ts` et `publicAftermath.ts`. Ce n'est ni un solveur général, ni une détection d’événement réel ; le **noyau causal confidentiel n’est pas présent dans ce dépôt**.


## Compte V4.1 — thème clair et données locales

Le mode nuit est supprimé du rendu, de la page Compte et du modèle de compte. Les profils précédemment créés sont **conservés** ; seule leur ancienne préférence de thème est retirée lors du chargement.

L'espace Compte présente quatre sections : **Profil** (coordonnées et centres d'intérêt), **RSVP** (réponses locales qui ne sont pas envoyées), **Parcours** (étapes du cadran) et **Mes données** (état de stockage, téléchargement JSON, remise du profil fictif avec confirmation).

- La sauvegarde est effectuée dans le stockage local du navigateur, sans authentification ou partage entre appareils.
- L'export JSON contient les coordonnées et informations RSVP : il doit être conservé de manière privée.
- La réinitialisation replace **uniquement** le profil/RVSP/parcours par la démonstration et ne supprime pas les playlists ou préférences audio.
- La préférence de partage des coordonnées est une intention enregistrée localement ; elle n'autorise aucune diffusion aux autres invités dans cette version.
- La sélection d'une navette est un souhait local, pas une réservation effective.


## V5 — cadran unique et portraits dans la colonne droite

- Suppression du mode recto/verso, de son bouton et du raccourci clavier `F`.
- Le cadran 2D et ses nœuds de personnes colorés restent interactifs. Aucun cercle de portraits ne recouvre désormais les anneaux temporels.
- Les photos des personnes apparaissent à droite de leurs informations dans l’inspecteur (sélection, intervenants du moment, conséquences) et dans les fiches/listes détaillées.
- Cliquer une vignette permet de sélectionner la personne correspondante dans le cadran sans changer de face.
- Avatar avec initiales de secours en cas d'absence ou d’échec de chargement d’une photo externe.
- Ce changement n’ajoute ni authentification ni partage réel de portraits ; les profils restent fictifs/localement modifiés.


## V6 — Zéro surcharge

Le site public utilise une seule face 2D et **trois modes principaux** : Explorer, Et si ?, Rejouer. Sur la vue par défaut, seuls le temps, les moments et les personnes sont dessinés. Les couches Calendrier, Parcours, Souvenirs, Musique et l’affichage détaillé des intérêts sont accessibles via **Explorer les couches**. Le cadran et ses interactions au clavier sont conservés.

L’inspecteur montre une fiche unique condensée : instant, titre, personnes avec portraits et, pour l’incident fictif, retard, rôles touchés et nombre d'options. Les explications, conséquences détaillées, régie et fiches historiques s’ouvrent sur demande. Le mode Et si ? donne toujours accès au curseur de retard, à la chaîne de causes et à trois plans; le mode Rejouer lance le simulateur de chronologie préparée. Les impacts cachés et consignes restent dans les outils avancés.

Aucun calcul propriétaire du noyau privé n’a été déplacé vers le dépôt public. Aucun événement réel ni notification n’est produit.
