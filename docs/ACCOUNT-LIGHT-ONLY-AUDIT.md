# RIPPLECIRCLE — Audit Compte et suppression du mode nuit

## État observé avant la modification

1. `account.theme` était stocké en localStorage (clé `regie.account.v2`), conditionnait la classe thème de toute la page et pilotait des variantes dans les aiguilles SVG.
2. L'onglet `Affichage` ne proposait que « Mode jour » et « Mode nuit » ; il était devenu redondant avec un design clair unique.
3. Le RSVP et le souhait de navette étaient purement locaux ; certains textes laissaient comprendre qu'ils étaient déjà partagés avec traiteur et transport.
4. La préférence `contactVisible` est stockée mais n'entraîne aucun transfert vers les autres personnes, puisqu'il n'existe pas de service de partage.
5. La photo de profil en base64 est stockée localement ; une photo trop lourde peut faire échouer l'enregistrement selon le quota du navigateur.
6. Il n'existait ni export du profil ni remise aux données fictives avec confirmation.

## Modifications implémentées

- Thème clair permanent ; suppression des CSS d'override et de l'option nuit, sans incidence sur les couleurs sémantiques des anneaux.
- Migration conservatrice : seule la propriété `theme` de l'ancien profil est retirée. Identité, RSVP, centres d'intérêt et parcours demeurent identiques.
- Compte en quatre sections : Profil, RSVP, Parcours, Mes données.
- Textes qui différencient rigoureusement sauvegarde locale, intention future et envoi réel.
- Téléchargement JSON local ; réinitialisation volontaire à deux étapes du profil seulement.
- Photo limitée à JPEG/PNG/WebP et 1,5 Mo, avec message d'erreur si type ou lecture invalides.

## Limites connues

- Aucune identité de compte authentifiée, aucun backend ni synchronisation multi-appareils ; ne pas prétendre autrement.
- `localStorage` n'offre ni sécurité de coffre-fort ni garantie de sauvegarde ; exporter le fichier peut être nécessaire avant de changer d'appareil.
- Préférence de contact non partagée ; les notifications et invitations restent hors champ.
- La réinitialisation n'efface pas toutes les autres données locales liées à l'application.
