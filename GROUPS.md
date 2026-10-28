# Groupes de voyage NaVigue

## Activation du serveur

1. Ouvrir le SQL Editor du projet Supabase `acznzodljeaxzkhrivmm`.
2. Exécuter **supabase-groups.sql** en entier. La migration est additive et transactionnelle ; elle n’altère pas les tables des profils enfant ou des favoris.
3. Elle crée les tables, fonctions d’invitation et de partage, règles RLS, publication Realtime et le bucket **privé** `travel-gallery` (50 Mo/fichier).
4. Avec deux comptes adultes de test, créer un groupe, transmettre son code au deuxième compte et le rejoindre. Avec un troisième compte hors du groupe, vérifier l’absence d’accès.
5. Dans deux navigateurs/appareils, vérifier messages et positions. Vérifier aussi l’arrêt manuel du partage, le retrait d’un membre et l’envoi/lecture d’une photo et d’une vidéo.

Aucune clé secrète ne doit être ajoutée au navigateur. Le client Supabase existant et la clé publique du projet suffisent une fois les règles serveur installées.

## Utilisation

Ouvrir **Menu → Mes groupes de voyage**, puis se connecter au compte adulte. Choisir un prénom pour le groupe. Créer un groupe ou rejoindre avec son code privé.

- **Discussion** : texte instantané (2 000 caractères), 100 derniers messages affichés, Realtime et actualisation périodique de secours.
- **Positions en direct** : consentement explicite puis autorisation du navigateur. Visibilité limitée au groupe sélectionné. Aucun historique : le dernier point remplace le précédent. Mise à jour au plus toutes les 10 secondes lorsque le navigateur fournit un point récent. Les points expirent après 90 secondes sans mise à jour ; les lignes expirées sont purgées lors des publications suivantes. Les cercles indiquent la précision GPS, pas une position garantie.
- **Arrêt** : bouton dédié, fermeture du panneau, changement de groupe, déconnexion ou passage en mode enfant. Masquer la page arrête aussi le partage. La session volontaire est limitée à une heure. En cas de fermeture brutale ou de panne réseau, la suppression est au mieux immédiate et l’expiration serveur garantit la disparition sous 90 secondes. Le partage en arrière-plan n’est pas garanti par une application web.
- **Galerie** : choix ou capture par le téléphone, aperçu, légende et partage explicite. Photos JPEG/PNG/WebP ; vidéos MP4/WebM/QuickTime ; maximum 50 Mo. Les fichiers sont téléchargés avec le compte connecté quand l’utilisateur demande à les voir, puis affichés via une URL locale temporaire, révoquée en quittant le groupe. Pas de galerie publique ni de lien signé durable. Les fichiers originaux peuvent contenir leurs métadonnées de capture.
- **Voyage et membres** : destination, date et programme modifiables par le créateur ; les autres membres peuvent proposer des changements dans la discussion. Le créateur peut retirer un membre ou régénérer l’invitation. Chaque nouveau code invalide le précédent ; validité 7 jours, 50 membres maximum.
- **Quitter** : un membre perd l’accès et son dernier point GPS est supprimé. Ses messages et médias déjà partagés restent au groupe. Le créateur reste membre ; transfert de propriété et suppression complète d’un groupe ne sont pas encore proposés.

Les groupes sont désactivés dans le mode enfant. La carte porte sur les membres du groupe qui partagent volontairement, sans recherche publique de personnes ni suivi de contacts extérieurs au groupe.

## Vérifications reproductibles

```powershell
node tests/groups.cjs
node tests/regression.cjs
node tests/outing.cjs
```

La migration et les contrôles RLS peuvent être testés sans compte ni données réelles avec PostgreSQL/PGlite dans une base en mémoire :

```powershell
npm install --prefix "$env:TEMP\navigue-db-test" --no-audit --no-fund @electric-sql/pglite
node tests/groups-db.cjs "file:///$($env:TEMP.Replace('\','/'))/navigue-db-test/node_modules/@electric-sql/pglite/dist/index.js"
```

Le banc de test fournit uniquement les primitives `auth.uid`, utilisateurs et tables Storage nécessaires. Les mêmes assertions SQL sont dans `tests/groups-rls.sql`, à exécuter sur un **projet Supabase de test** après la migration. Tout est annulé par `rollback`. Les tests couvrent refus des non-membres, usurpation d’auteur, accès de membre, édition réservée au créateur, révocation, expiration GPS et accès privé aux objets Storage. Ils ne remplacent pas le test du service HTTP Storage ni d’une connexion Realtime hébergée.

`tests/groups-fixture.html` est un banc d’interface **uniquement local**, avec faux compte, faux messages et GPS simulé. Aucun appel à la base réelle. Il sert à tester l’ergonomie et les transitions du partage ; il ne constitue pas une preuve de fonctionnement multi-appareils en production.
