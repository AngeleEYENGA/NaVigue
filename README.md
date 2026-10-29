# NaVigue

NaVigue est une application web de navigation pensée pour les enfants et les adultes qui souhaitent des itinéraires faciles à comprendre, des consignes vocales et une interface accessible.

## Développement local

Ouvrez `start-navigue.bat` sous Windows. Il lance un serveur HTTP local et ouvre NaVigue dans le navigateur. Les cartes, la géolocalisation et les itinéraires nécessitent une connexion Internet.

## Publication automatique sur Vercel

1. Dans Vercel, choisissez **Add New → Project**, importez `AngeleEYENGA/NaVigue` depuis GitHub et choisissez **Other** comme framework.
2. Aucun build n’est nécessaire : laissez la commande de build vide et configurez le dossier racine (`.`) comme dossier de sortie.
3. Vercel fournit une adresse `https://<nom-du-projet>.vercel.app`. Choisissez un nom de projet disponible, puis relevez le domaine de production affiché dans **Settings → Domains**.
4. Chaque push sur la branche `main` déclenchera automatiquement un nouveau déploiement.
5. Pour l’authentification Supabase, définissez le domaine de production comme **Site URL**. Ajoutez l’URL complète de NaVigue (par exemple `https://<nom-du-projet>.vercel.app/`) aux **Redirect URLs** Supabase et l’origine seule (sans chemin) aux origines JavaScript autorisées chez Google.

Le callback OAuth Google/Microsoft reste l’URL du projet Supabase et non le domaine Vercel. Il est indiqué dans [DEPLOYMENT.md](./DEPLOYMENT.md).

## Espace famille et configuration Supabase

- `supabase-config.js` contient uniquement le Project URL et la clé publique `anon`/`publishable`. Cette clé sera visible dans le dépôt public et dans le navigateur ; elle n’est pas une clé secrète. Ne mettez jamais une clé `service_role`, `secret` ou un secret client OAuth dans ce dépôt.
- Exécutez [supabase-schema.sql](./supabase-schema.sql) dans l’éditeur SQL Supabase avant d’utiliser les profils enfant et les favoris.
- Configurez les fournisseurs Google, Microsoft/Azure et e-mail ainsi que les URL de redirection selon [DEPLOYMENT.md](./DEPLOYMENT.md).
- Les tables des profils et favoris doivent conserver leurs règles Row Level Security (RLS). Les itinéraires et cartes nécessitent une connexion Internet.

## Fonctionnalités

- Calcul d’itinéraires piéton, vélo, voiture et transports en commun.
- Consignes étape par étape et assistance vocale.
- Conversation vocale à la demande : NaVigue comprend des demandes de trajet formulées simplement, peut répéter une consigne et répond avec la voix française disponible dans le navigateur. La qualité et la disponibilité de la voix/reconnaissance varient selon le navigateur et l’appareil ; la reconnaissance vocale peut être traitée par le navigateur ou son fournisseur.
- Vues carte, perspective et rue, selon la couverture des services cartographiques.
- Espace de compte adulte avec nom d’accueil personnalisé, profils enfant gérés par le parent et destinations favorites préparées à l’avance. Les enfants n’ont pas de connexion autonome : un adulte ouvre leur profil et le mode enfant limite les destinations aux adresses enregistrées.
- Application web installable (PWA) sur les navigateurs compatibles.

## Langues et conversation

Les commandes principales sont disponibles en français, anglais, espagnol, allemand et chinois simplifié. La langue et le thème (clair, sombre ou automatique) se choisissent en haut de page ou dans les préférences.

La conversation distingue les salutations, remerciements, demandes d’aide et demandes de trajet. Une demande explicite comme « je veux aller au Louvre » lance la recherche ; un lieu donné seul demande une confirmation « oui » / « non ». La reconnaissance reste dépendante du navigateur. Les restrictions des destinations du mode enfant restent appliquées.

« À découvrir en chemin » recherche dans un rayon de 5 km autour de la destination : parcs, restauration, culture, hôtels et autres hébergements, motels, bowling et activités (cinéma, piscine, sports, parcs de loisirs, etc.). La disponibilité dépend des lieux référencés dans OpenStreetMap et du service Photon. Une panne du service est signalée séparément d’une absence de résultats.

Les portions à pied des trajets en transports demandent les tracés et les instructions détaillés, y compris les correspondances. Les changements de direction sont calculés sur le tracé lorsque le fournisseur renvoie uniquement « CONTINUE ». Les segments droits consécutifs sont regroupés ; les escaliers et les virages sont conservés. Les noms de rues manquants sont recherchés par identifiant de voie dans OpenStreetMap via Overpass, sans bloquer l’affichage en cas de panne. Les rues sans nom et les numéros de sortie inconnus ne sont pas inventés. Sans instructions disponibles, la portion est signalée comme non détaillée. Vérification : `node tests/transit-directions.cjs`.

« Parler avec NaVigue » active les réponses vocales. Une adresse donnée après la question de destination calcule le trajet et démarre le guidage GPS ; une adresse isolée hors de ce contexte demande confirmation. Le micro est suspendu pendant chaque annonce, puis l’écoute reprend. Les commandes « répète », « pause », « reprends », « étape suivante », « je suis monté », « je suis descendu » et « arrête la navigation » contrôlent le guidage. L’entrée dans un transport et la descente restent confirmées par l’utilisateur. Une position GPS trop imprécise ne fait pas avancer les petites étapes automatiquement. Le mode manuel permet de suivre les étapes par commande vocale lorsque le GPS manque. Tests simulant la reconnaissance, la synthèse et le GPS : `node tests/voice-guide.cjs` ; essais sur téléphone avec de vraies permissions à compléter.

Vérification des régressions : `node tests/regression.cjs` (aucune dépendance à installer). Les tests simulent les transcriptions et réponses cartographiques ; ils ne vérifient pas la capture réelle du microphone.

## Organiser ma sortie — première version

Ouvrez « Organiser ma sortie » pour préparer un trajet **à pied** : départ et arrivée explicites, temps disponible, budget souhaité en euros, détour maximal, durée d’une pause et centres d’intérêt. Cette version ne demande pas de géolocalisation et ne conserve pas les réponses après rechargement.

Le parcours direct et chaque détour proposé sont calculés par le service de routage piéton. La recherche interroge Photon autour de quatre points répartis par distance sur le trajet, retient les lieux à moins de 600 m du tracé, puis vérifie jusqu’à huit parcours passant par un lieu pour proposer quatre pauses au maximum. Les suggestions sont triées dans l’ordre du parcours. La durée affichée comprend le trajet complet et **une** pause : les suggestions ne forment pas encore un circuit cumulant plusieurs visites. La recherche est limitée aux trajets à pied de moins de 20 km et n’est pas exhaustive.

Le budget reste un souhait : aucun prix de menu ou billet n’est inventé ou garanti. Un budget nul restreint les visites aux parcs et monuments extérieurs (gratuité à confirmer), avec les services de santé si demandés. Prix, accessibilité et horaires doivent être vérifiés auprès des lieux. Cette première version n’annonce pas de recommandations automatiques pendant la marche et n’ajoute pas les pauses au guidage. « Afficher le trajet direct » réutilise la carte et le guidage existants ; les fiches permettent d’inspecter les lieux sur OpenStreetMap.

La fonctionnalité est traduite dans les cinq langues et désactivée en mode enfant. Tests : `node tests/regression.cjs` et `node tests/outing.cjs`.

## Groupes de voyage privés

Le menu comprend un espace de groupes (compte adulte) : invitations privées, messagerie, carte des positions volontairement partagées, préparation du voyage et galerie photo/vidéo avec capture selon l’appareil. **L’activation de la migration `supabase-groups.sql` sur le serveur est nécessaire.** Voir [GROUPS.md](./GROUPS.md) pour l’installation, les limites et les tests. Aucun partage GPS ni envoi de média n’est lancé automatiquement.
