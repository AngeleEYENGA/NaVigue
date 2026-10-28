# Héberger et installer NaVigue

NaVigue est un site statique : aucun serveur applicatif ni compilation n’est nécessaire. Il peut être publié gratuitement sur GitHub Pages, Cloudflare Pages ou Netlify. Ces services fournissent une adresse HTTPS, requise pour l’installation de l’application et l’accès à la géolocalisation.

## Publication automatique sur Vercel

Le dépôt public est [AngeleEYENGA/NaVigue](https://github.com/AngeleEYENGA/NaVigue).

1. Dans Vercel, sélectionnez **Add New → Project**, puis importez `AngeleEYENGA/NaVigue` depuis GitHub. Autorisez Vercel à accéder au dépôt si demandé.
2. Choisissez **Other** comme framework, laissez la commande de build vide et définissez le dossier de sortie à `.` (racine du dépôt). NaVigue est déjà un site statique.
3. Choisissez un nom de projet Vercel disponible et déployez. Le domaine de production sera affiché dans **Project → Settings → Domains**, de la forme `https://<nom-du-projet>.vercel.app`. Ce nom doit être choisi lors de l’import ; ne configurez pas OAuth avec un domaine supposé avant de l’avoir vérifié dans Vercel.
4. Chaque nouveau commit poussé sur la branche `main` déclenchera automatiquement un déploiement. Les aperçus issus d’autres branches/PR ne sont pas l’URL de production.
5. Après le premier déploiement, ajoutez l’URL complète de production (par exemple `https://<nom-du-projet>.vercel.app/`) dans Supabase **Authentication → URL Configuration → Redirect URLs**, et définissez-la comme **Site URL**. Ajoutez aussi l’origine `https://<nom-du-projet>.vercel.app` à **Authorized JavaScript origins** dans Google Cloud.
6. Dans Microsoft Entra, inscrivez le callback Supabase ci-dessous comme URI de redirection Web ; le callback du fournisseur ne change pas avec le domaine Vercel.

La connexion de comptes Google/Microsoft renvoie d’abord vers le callback Supabase. Celui-ci retourne ensuite le parent à la page Vercel exacte utilisée par l’application (`redirectTo`).

## Publication simple avec GitHub Pages

1. Créez un dépôt GitHub et ajoutez les fichiers du dossier NaVigue, notamment `index.html`, `manifest.webmanifest`, `service-worker.js`, `family-auth.js`, `supabase-config.js`, `supabase-schema.sql` et les logos SVG.
2. Dans **Settings → Pages**, choisissez le déploiement depuis la branche principale et le dossier `/ (root)`, puis enregistrez.
3. Attendez la publication et ouvrez l’adresse HTTPS affichée dans les réglages Pages. L’application utilise des chemins relatifs et peut être servie depuis un sous-dossier.
4. Sur téléphone ou tablette, utilisez le menu de partage du navigateur pour ajouter NaVigue à l’écran d’accueil. Sur Chrome ou Edge pour ordinateur, choisissez **Installer** dans la barre d’adresse ou le menu.

Le service worker conserve uniquement l’interface, le script de connexion et les logos locaux. Il ne met pas en cache les positions, les itinéraires, les cartes ni les réponses des services externes : la navigation nécessite une connexion internet. Les changements publiés remplacent automatiquement l’ancienne version de l’interface au prochain chargement.

## Créer l’espace famille (Supabase)

1. Créez un projet Supabase gratuit et ouvrez **SQL Editor**. Exécutez le contenu de `supabase-schema.sql` pour créer les tables de profils enfant et d’adresses favorites avec Row Level Security (RLS).
2. Dans **Project Settings → API**, copiez le Project URL et la clé publique `anon`/publishable dans `supabase-config.js`, dans les champs `url` et `anonKey`. Ces valeurs sont destinées au navigateur. **N’utilisez jamais la clé `service_role` dans le site.**
3. Dans **Authentication → URL Configuration**, définissez l’adresse HTTPS de production comme URL du site. Ajoutez `http://127.0.0.1:8765/index.html` aux redirections autorisées pour les tests locaux, ainsi que l’URL exacte de la page publiée.
4. Dans **Authentication → Providers**, activez l’e-mail/mot de passe et configurez Google ainsi que Microsoft/Azure avec les identifiants OAuth créés chez ces fournisseurs. Pour le projet configuré dans NaVigue, le callback à inscrire chez Google et Microsoft est `https://acznzodljeaxzkhrivmm.supabase.co/auth/v1/callback`.
5. Publiez tout le dossier, puis testez la création d’un compte adulte, la confirmation par e-mail, les deux connexions OAuth, la création d’un profil enfant et l’ajout/la suppression de favoris.

Les enfants n’ont pas d’identifiants OAuth : un parent authentifié crée leurs profils et prépare les adresses. RLS limite la lecture et la gestion des profils et adresses au compte adulte propriétaire. Ne retirez pas ces politiques et ne rendez pas les tables publiques. Le navigateur stocke les coordonnées de favoris chez Supabase, mais NaVigue ne conserve pas la position GPS courante dans ces tables.

## Services cartographiques

La géolocalisation et le calcul d’itinéraires nécessitent des services tiers et transmettent les coordonnées nécessaires à leur fonctionnement. Les adresses favorites sont enregistrées dans le projet Supabase du propriétaire. Le calcul des transports en commun utilise Transitous, dont le service est communautaire, non commercial et soumis à ses conditions, à l’attribution des sources et aux exigences de publication/contact du projet. Vérifiez ces conditions avant de publier NaVigue ou de l’utiliser pour un projet commercial ; une autre source de transports devra alors être choisie.
