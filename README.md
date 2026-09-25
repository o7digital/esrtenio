# Estenio — Premium Blue

Portage fidèle de la maquette approuvée vers Astro, avec React limité aux interactions qui en bénéficient.

## Architecture

- Astro génère toute la page statiquement.
- React hydrate uniquement les sélecteurs de spécialités et de profils.
- Le menu mobile et le formulaire de démonstration utilisent un JavaScript léger.
- Le formulaire ne transmet et ne stocke aucune donnée.
- La balise `noindex,nofollow` de la démo est conservée.
- La maquette HTML et son brief d’origine sont archivés dans `reference/`.

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

Les tests Playwright couvrent les largeurs 1440, 1024, 768 et 390 px, les quatre spécialités, les trois profils, la navigation clavier des onglets, le menu mobile, les ancres, l’absence de débordement horizontal, les ressources et erreurs console, ainsi que la validation locale du formulaire sans requête ni stockage.

## Limites connues

- Le mot-symbole typographique reste provisoire jusqu’à la fourniture du logo officiel.
- Le visuel architectural est conceptuel et ne représente pas les bureaux réels d’Estenio.
- Le formulaire est volontairement une démonstration sans backend, CRM ou email.
- La validation automatisée du rendu est exécutée sous Chromium ; des contrôles manuels multi-navigateurs restent recommandés avant un futur lancement autorisé.
- Aucun déploiement de production n’est configuré ou exécuté.
