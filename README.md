# Estenio — migration Astro Premium Blue

Migration Astro du contenu accessible de `estenio.com.mx`, avec la direction visuelle bleue de la maquette et sans publication WordPress. Le contenu espagnol du site source fait autorité ; les textes de démonstration de la maquette ne sont pas utilisés dans les pages migrées.

## Architecture

- Astro génère six routes statiques : `/`, `/nosotros/`, `/auditoria/`, `/legal/`, `/asesoria-infonavit/` et `/gestor-de-pensiones/`.
- Les accordéons natifs et le menu mobile utilisent un JavaScript léger ; React n’est pas nécessaire pour ces interactions.
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

Les tests Playwright couvrent les six routes, les largeurs 1440, 1024, 768 et 390 px, la navigation, le menu mobile, l’absence de débordement horizontal, les ressources et erreurs console, le contenu critique des pages et la validation locale du formulaire sans requête ni stockage.

## Limites connues

- Le logo et les images originales accessibles ont été récupérés dans `public/assets/original/`.
- Les ressources du sitemap et de `robots.txt` restent à confirmer : l’hébergement répondait HTTP 406 pendant l’inventaire.
- Le formulaire est volontairement une démonstration sans backend, CRM ou email.
- La validation automatisée du rendu est exécutée sous Chromium ; des contrôles manuels multi-navigateurs restent recommandés avant un futur lancement autorisé.
- Aucun déploiement de production n’est configuré ou exécuté.
