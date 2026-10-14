# RIPPLECIRCLE V9 — partition temporelle du mariage

## Origine de la vision
Archive reçue `unify-ripplecircle-2d-and-3d.zip` : modèle SVG avec couronnes, moteur `src/audio/score.ts` (pistes et pas rythmiques) et `src/audio/sonify.ts` (notes par gestes, pentatonique et gamme). Un prototype V9 transpose cette **interaction** aux besoins de mariage sans confondre minutes civiles et BPM.

## Modèle V9 expérimental
- Phases successives du matin à la soirée, de l'extérieur vers l'intérieur. Chaque couronne représente une phase et possède ses horaires.
- Taxonomie unique de métiers `ROLES` indépendante des occurrences de leur travail dans une phase.
- Une même profession peut être placée plusieurs fois et sur plusieurs phases, via des segments `Segment` : phase, rôle, début et fin.
- Bouton ou pastille d'un rôle : note synthétique Web Audio **uniquement après interaction** ; zoom géométrique sur la couronne et ouverture de l'éditeur latéral unique.
- Vue éditeur : pistes type logiciel de musique, horloge civile, grille de 15 minutes ; clic crée un clip, glisser déplace, poignée de droite redimensionne, champs d'horaires permettent une correction précise.
- Mini-lecture sonore fictive des points de départ. **Cette lecture ne joue pas les vrais titres du mariage.**
- Modifications conservées uniquement dans localStorage et réinitialisables : démonstration sans serveur.

## Important — ce qui n'est pas développé
- Pas de réservation de prestataire ni de vérification d'un agenda professionnel, d'un trajet, d'un tarif ou d'une véritable disponibilité.
- Pas de synthèse automatique des conflits inter-métiers ou d'optimisation causale. Une alerte locale détecte seulement les chevauchements de segments d'une même piste.
- Pas de musique enregistrée/licenciée et pas de synchronisation réelle multijoueur.
- Pas de rendu Three.js. La source jointe mentionne la 3D mais les interactions réutilisées ici sont 2D et Web Audio.
- Aucune partie du noyau causal confidentiel n'est copiée ou exposée.

## Suite recommandée
1. Valider avec un photographe, un traiteur et un musicien : les segments ont-ils la bonne granularité et les bonnes contraintes ?
2. Raccorder l'interface de montage à des moments canoniques par mariage, avec versions et historique non destructif.
3. Ajouter les types d'offres, les trajets, puis les disponibilités réelles et les prix explicites pour le couple.
4. Faire de la partition un instrument collaboratif, avec permissions, statuts de réservation et résolution des conflits.

Branches : V9 empilée sur V8, elle-même sur V7 ; aucune fusion de la V6 publique n'est demandée automatiquement.