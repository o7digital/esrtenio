# Instructions Codex — Estenio Premium Blue

## Mission
Reprendre fidèlement la maquette approuvée fournie dans ce dossier et la convertir en projet Astro avec composants React uniquement pour les interactions qui en bénéficient. Livrer le code fonctionnel et une prévisualisation locale. La maquette HTML est la référence visuelle, pas une invitation à refaire le design.

## Première étape
Lire le README et index.html. Inspecter le dépôt de destination et ses instructions avant toute modification. Travailler dans un dossier ou une branche dédiée, sans écraser un projet existant. Ouvrir la référence dans un navigateur avant de la porter. Préserver le site WordPress actuel et ses données. Ne rien publier en production sans demande explicite.

## Direction approuvée à préserver
- Bleu Estenio #002a47, bleu profond #001c32, bleu glacier #a8d9f6, accent #125bea, blanc et gris bleuté.
- Aucun café, brun, cuivre, beige ou or.
- Conserver exactement la composition, la hiérarchie, les proportions et les textes espagnols de la référence.
- Grand visuel architectural bleu, titre « Certeza para lo que has creado. Y lo que viene. », services interactifs, parcours par profil, méthode et contact.
- Conserver assets/architecture.webp, sans dépendance à une URL externe.
- Le mot-symbole typographique « estenio » est provisoire : intégrer le logo officiel uniquement lorsqu'il est fourni ou récupéré avec succès, sans inventer un emblème.
- La photographie est une création conceptuelle, pas une photo des bureaux réels.

## Implémentation
1. Respecter le gestionnaire de paquets et le lockfile existants. Pour un projet neuf, créer Astro avec TypeScript et l'intégration React si nécessaire ; vérifier la documentation officielle actuelle pour les commandes.
2. Découper la page en composants : Header, Hero, TrustStrip, FirmIntro, Expertise, Heritage, AudienceSelector, Method, Contact, Footer.
3. Extraire les styles dans des fichiers organisés et des variables globales. Garder le HTML initial rendu côté serveur ou généré statiquement.
4. Utiliser des îlots React pour les sélecteurs de services/profils si utile, avec hydratation limitée. Le menu peut rester en JavaScript léger. Éviter une application React monopage pour toute la page.
5. Préserver les quatre spécialités et leurs panneaux, les trois profils et leurs contenus, les ancres et liens téléphone/email.
6. Assurer clavier, focus visible, aria-selected/aria-pressed, gestion du menu mobile et prefers-reduced-motion.
7. Conserver le formulaire en mode démonstration, sans envoi ni stockage. Garder son avertissement visible. Aucune fausse confirmation d'envoi. Une intégration HubSpot/CRM/email nécessite une configuration et une demande explicite ultérieure.
8. Préserver noindex,nofollow sur cette démo. Pour une future production seulement : domaine canonique validé, métadonnées par page, sitemap, robots et données structurées fondées sur les informations réelles. Retirer noindex uniquement lors du lancement autorisé.
9. Garder l'image WebP locale, ses dimensions réservées et sa priorité de chargement dans le hero. Éviter le lazy-loading du hero. Les images secondaires peuvent être différées.
10. Ne pas inventer d'avis, chiffres de résultats, certifications, membres d'équipe ou logos de clients.

## Validation obligatoire avant livraison
- Comparer visuellement la référence HTML et le portage, sur ordinateur et mobile.
- Vérifier à 1440, 1024, 768 et 390 px : débordements, titre, navigation, images et formulaire.
- Vérifier les 4 spécialités, les 3 profils, le menu mobile et toutes les ancres.
- Tester la navigation clavier des onglets et la validation native du formulaire.
- Confirmer qu'aucune requête d'envoi ou de stockage n'est déclenchée par le formulaire.
- Exécuter le build et corriger les erreurs. Vérifier l'absence de ressources manquantes et d'erreurs console.
- Documenter les commandes exactes pour installation, prévisualisation et build, les versions utilisées et les limites restantes.

## Livraison
Fournir le projet Astro/React complet, son README, les commandes de lancement et une prévisualisation. Conserver la direction approuvée. Ne pas modifier le domaine estenio.com.mx ni déployer sur son hébergement sans autorisation explicite.
