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

Le cercle conserve le zoom, le déplacement, la sélection d'éléments, les couleurs de couches, les modes jour/nuit, le recto/verso et les indicateurs d'orchestration.

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

- **Header sans navigation** : seule l'entrée Compte demeure ; le mode jour/nuit se règle dans Compte → Affichage.
- **Commandes rondes** : les vues sont accessibles autour du cadran, pas dans le header.
- **Un cadran centré** : diamètre limité par la hauteur de la fenêtre et les colonnes. Les aiguilles centrales suivent une horloge standard 12 heures (12 en haut, rotation horaire), tandis que l'aiguille rouge extérieure conserve l'axe temporel linéaire 15:00 → 05:00 du programme.
- **Colonne causale prioritaire** : synthèse cause → conséquences → plan B visible sans parcourir les panneaux ; sélection d'une personne ou d'un moment = informations uniques à droite.
- **Détails secondaires repliés** : temps de régie, simulateur d'actions, liste exhaustive ; aucune de ces vues n'est nécessaire pour comprendre le premier écran.
- **Démo explicite** : horloge de régie et causalité sont simulées, pas un événement réel.
