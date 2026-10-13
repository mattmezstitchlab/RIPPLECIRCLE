# RIPPLECIRCLE V7 — audit marché et hypothèse produit

Dernière recherche exploratoire : 13 octobre 2026.

## Innovations à ne pas présenter comme inédites
- **Calendrier circulaire :** [Sectograph](https://play.google.com/store/apps/details?id=prox.lab.calclock) présente les journées en 12 heures, les événements, les intervalles libres et des options de zoom (1 à 12 heures).
- **Planification optimisée :** [Akiflow](https://product.akiflow.com/en/help/articles/3161671-schedule-optimizer) réorganise les tâches lors d'une modification ; [Shoflo](https://learn.shoflo.tv/en/articles/14604528-duration-column) recalcule les horaires de conducteur.
- **Souvenirs récurrents :** [Day One](https://dayoneapp.com/guides/tips-and-tutorials/on-this-day-view/) rappelle les journaux, photos et souvenirs d'années précédentes.
- **Interfaces zoomables et lentilles :** [US20220083208A1](https://patents.google.com/patent/US20220083208A1/en) et [WO2014161011A1](https://patents.google.com/patent/WO2014161011A1/en) décrivent divers comportements zoom/focus/context.

Aucune recherche limitée ne peut prouver l'absence de tout produit similaire. Aucun avis sur la brevetabilité n'est formulé ici.

## Piste la plus distinctive : un instant comme point d'entrée vers un monde
L'interaction circulaire ne devrait pas être une variante esthétique du calendrier, mais une porte à travers trois dimensions complémentaires :
1. **Temps** — dézoomer la journée, révéler une demi-journée ou cadrer un quart correspondant au moment sélectionné ;
2. **Conséquences** — « Et si ? » introduit un changement et révèle son impact sur d'autres moments, personnes et plans alternatifs, avec qualification des liens ;
3. **Mémoire sociale choisie** — les personnes autorisées associent une photo, une musique ou un témoignage à un moment partagé et découvrent de nouvelles contributions lors de leur retour.

Hypothèse de rétention à valider : la combinaison utilité immédiate + interactions visuelles courtes + souvenirs partagés *consentis* peut favoriser le retour sans récompenses aléatoires ni notifications compulsives.

## V7 réalisée (branche expérimentale)
- Dock de contrôle fixe en bas de l'écran, avec réserve d'espace pour éviter le recouvrement du cadran sur les cinq formats cibles ;
- Un **seul bouton de cadrage**, répétable : Entier → Demi (hémisphère supérieur cadré) → Quart lié à l'angle choisi → Entier ;
- Double-clic sur le cadran pour faire avancer le cadrage à l'endroit touché ; choix de moment/personne qui met à jour le secteur ciblé ;
- Zoom +/- toujours disponible au dock, réinitialisation, relations et volume regroupés sous Réglages ;
- SVG recalculé par `viewBox`, sans CSS transform sur le contenu interactif ; état accessible au clavier (Entrée, 0, flèches et + / -) ;
- Mode demi-cadran masquant visuellement la moitié inférieure. Ne change pas le planning, la musique ni les données.

## Mesures de validation
Tests du cycle, des quatre secteurs, du recadrage exact (2×), de la position fixe du dock et des cinq formats desktop/tablette/mobile. Avant éventuelle fusion, faire tester par des utilisateurs si la « moitié » doit représenter le demi-cadran du haut ou une demi-journée glissante : ce sont deux besoins différents.

Le projet d'algorithme causal confidentiel ne figure pas dans cette branche.
