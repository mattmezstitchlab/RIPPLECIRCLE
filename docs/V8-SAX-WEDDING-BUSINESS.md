# RIPPLECIRCLE V8 — Site Matt Mez Sax et système de mariage

## Hypothèse produit
Le premier public est celui des futurs mariés souhaitant connaître la disponibilité de Matt Mez Sax. RIPPLECIRCLE devient ensuite la couche de coordination du même mariage plutôt qu'un annuaire général dès le premier jour.

## Parcours cible
1. Sélectionner année, mois et jour dans un cercle.
2. Vérifier une vraie disponibilité, y compris trajet, lieu et autres engagements. Prototype V8 : statut inconnu, courriel seulement.
3. Préciser cérémonie, cocktail, soirée ou plusieurs créneaux.
4. Après acceptation future : devis, contrat, acompte, projet mariage.
5. Inviter wedding planner, photographe, traiteur, DJ et autres prestataires autorisés dans le même calendrier.
6. Après l'événement, rattacher photos et souvenirs aux moments avec consentement.

## Pourquoi ne pas lancer la marketplace immédiatement
Mariages.net, The Knot, AskAce et Ouiii proposent déjà la recherche de prestataires, parfois par date. Le sujet distinctif à tester est une identité canonique de date et de projet partagée entre plusieurs professions, directement liée aux actions, documents, musique et conséquences du jour J.
Le meilleur test est un mariage réel dans lequel le saxophoniste reçoit une demande puis invite quelques partenaires consentants. Aucun annuaire inventé ou statut de disponibilité fictif.

## Modèle futur, NON implémenté
- project : identifiant, date, fuseau, lieu, couple, visibilité.
- professional : identité, activité, tarifs, rayon de déplacement.
- availability : blocages privés, marges de déplacement, temps tampon et source de planning autorisée.
- inquiry : demande datée, provenance, statut reçu/à traiter/répondu.
- engagement : devis, contrat signé, paiement/acompte effectivement constaté.
- moment : plage du jour J, ressources, musique et autorisations.
- membership : utilisateur invité, rôle, permissions, consentement.
- audit : journal compartimenté des décisions et changements.

Règle : jamais afficher « disponible » sans information fiable d'un agenda autorisé. Ne jamais exposer les détails des autres clients, les événements privés ou leurs données personnelles.

## Avant une vraie utilisation commerciale
- Connecter un calendrier réellement autorisé et vérifier fuseau Europe/Paris, décalages, trajets et conflits.
- Mettre en place une API de demandes sécurisée, confirmation d'envoi, antispam et politique de conservation RGPD.
- Rendre les tarifs, frais, délais, conditions, devis et paiements contractuellement fiables.
- Tester de bout en bout du choix de date à la prestation. Supprimer le contenu fictif des pages destinées aux clients.
- Introduire les prestataires par invitation, avec séparation des données par mariage.

## État de la V8 expérimentale
- [x] Cadran année → mois → jour et sélection native.
- [x] Date lisible, délai avant événement et courriel prérempli.
- [x] Distinction explicite disponibilité inconnue / vraie réservation.
- [x] Entrée séparée vers la démo du cadran causal et contact prestataires.
- [ ] Synchronisation réelle et notifications.
- [ ] Authentification, demandes persistantes et contrats.
- [ ] Équipe de prestataires connectée sur un vrai mariage.

Aucun code du moteur causal confidentiel ni aucune clé de production ne sont ajoutés à cette branche.
