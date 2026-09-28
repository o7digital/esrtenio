# Estenio — migration Astro Premium Blue

Migration Astro du contenu accessible de `estenio.com.mx`, avec la direction visuelle bleue de la maquette et sans publication WordPress. Le contenu espagnol du site source fait autorité ; les textes de démonstration de la maquette ne sont pas utilisés dans les pages migrées.

## Architecture

- Astro génère six routes statiques : `/`, `/nosotros/`, `/auditoria/`, `/legal/`, `/asesoria-infonavit/` et `/gestor-de-pensiones/`.
- Les onglets accessibles au clavier, les accordéons natifs et le menu mobile utilisent un JavaScript léger ; React n’est pas nécessaire pour ces interactions.
- Le hero utilise la vidéo MP4 d’origine, téléchargée sans modification. Son poster est extrait de la même vidéo ; le mode `prefers-reduced-motion` n’affiche que ce poster et ne télécharge pas la vidéo.
- Albert Sans est hébergée localement ; les logos sont affichés intégralement avec `object-fit: contain`.
- Le formulaire de prévisualisation ne transmet et ne stocke aucune donnée.
- La balise `noindex,nofollow` est conservée sur chaque page.
- Les contenus et limites d’accès sont documentés dans [docs/page-map.md](docs/page-map.md).
- La maquette HTML et son brief d’origine restent archivés dans `reference/`.

## Commandes

```sh
npm install
npm run dev
npm run check
npm run build
npm run preview
npm test
```

Le serveur de développement est disponible par défaut sur <http://localhost:4321>. Le serveur de prévisualisation teste le build statique sur la même adresse.

## Versions validées

- Node.js 24.14.0
- npm 11.9.0
- Astro 7.3.5
- React / React DOM 19.3.0
- Playwright 1.63.0 (Chromium)
- TypeScript 6.0.3

## Validation

Les 14 tests Playwright couvrent les six routes, les largeurs 390, 768, 1440 et 1920 px, la navigation clavier, le menu mobile, l’absence de débordement horizontal, les images et erreurs console, la lecture vidéo, le mode réduit, les proportions des logos et la validation locale du formulaire sans requête ni stockage, y compris sans JavaScript. Exécuter `npm run build` avant `npm test`.

Les captures du hero, de Nosotros et des dix clients sont disponibles sur `/review/`. `node scripts/verify-visual.mjs` compare les textes à l’inventaire source et produit `docs/audit/visual-report.json` ainsi que les captures ; il attend le build servi sur `http://127.0.0.1:4323`, ou l’URL définie dans `SITE_TEST_URL`. Les instantanés source et captures intégrales sont ignorés par Git pour ne pas versionner le HTML WordPress et les gros PNG. Les WebP de livraison sont versionnés.

`scripts/audit-source.mjs`, `scripts/import-source-content.mjs` et `scripts/capture-reference.mjs` permettent l’audit, l’extraction exacte des textes et les captures source sans analytics ni requête de modification. Les scripts d’audit utilisent Chrome installé sur macOS ; les tests acceptent aussi Chromium Playwright sur les autres systèmes.

## Limites connues

- Le logo et les images originales accessibles ont été récupérés dans `public/assets/original/`.
- Le sitemap Yoast et `robots.txt` ont été relus avec succès : les six pages publiques listées sont couvertes.
- Le formulaire est volontairement une démonstration sans backend, CRM ou email.
- La validation automatisée du rendu est exécutée sous Chromium ; des contrôles manuels multi-navigateurs restent recommandés avant un futur lancement autorisé.
- Vercel héberge la prévisualisation non indexable. Déployer avec `vercel --yes`, puis `vercel --prod --yes` uniquement pour le projet Vercel autorisé. Ne jamais modifier le WordPress ni le domaine `estenio.com.mx`.
