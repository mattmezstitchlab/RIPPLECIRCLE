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
