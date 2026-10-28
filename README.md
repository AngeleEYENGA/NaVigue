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

Vérification des régressions : `node tests/regression.cjs` (aucune dépendance à installer). Les tests simulent les transcriptions et réponses cartographiques ; ils ne vérifient pas la capture réelle du microphone.
