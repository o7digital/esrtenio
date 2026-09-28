# Inventaire de migration Estenio

Inventaire réalisé le 27 septembre 2026 depuis la navigation et les liens internes accessibles sur `https://estenio.com.mx/`. Le sitemap et `robots.txt` retournaient une réponse 406 depuis l’environnement d’audit ; ils restent donc à confirmer avec l’accès d’administration WordPress.

| URL source | URL Astro | Contenu migré | Métadonnées | État |
| --- | --- | --- | --- | --- |
| `/` | `/` | Accueil, quatre services, deux services de pension, Nosotros, logos clients, contact | `Estenio Corporativo`, description source reprise | Migré |
| `/nosotros/` | `/nosotros/` | Histoire, valeurs, 16 membres de l’équipe, phrase de clôture, contact | Titre source et description issue du contenu | Migré |
| `/auditoria/` | `/auditoria/` | Service principal, quatre blocs détaillés et 18 services complémentaires | Titre source et description source reprise | Migré |
| `/legal/` | `/legal/` | Présentation, cinq blocs détaillés et 12 services complémentaires | Titre source et description source reprise | Migré |
| `/asesoria-infonavit/` | `/asesoria-infonavit/` | Présentation, méthode en cinq étapes, listes de services et lien webinar | Titre source et description source reprise | Migré |
| `/gestor-de-pensiones/` | `/gestor-de-pensiones/` | Services entreprise/personnel, trois témoignages, FAQ complète | Titre source et description source reprise | Migré |
| `/#footer` | `/#footer` | Adresse, email, téléphone et carte | N/A | Conservé comme ancre |

## Fonctionnalités et intégrations

- Formulaire Elementor/WordPress : champs `Nombre*`, `Email*`, `Teléfono`, `Compañía` et message conservés. La prévisualisation Astro intercepte la validation localement, sans `POST`, stockage ou fausse confirmation. Le backend/CRM doit encore être connecté.
- WhatsApp/Joinchat : présent sur le WordPress source (« HeyHola…», « Abrir chat »). Aucun widget de production n’est déclenché dans Astro ; le numéro, le fournisseur et le comportement du chat doivent être confirmés avant intégration.
- Google Site Kit / Google Analytics : le source charge `GT-T9B2F3VL`. Il n’est volontairement pas chargé dans la prévisualisation non indexable. ID, consentement et configuration de production restent à valider.
- Webinar INFONAVIT : lien source conservé vers `https://linktr.ee/ESTENIOMX`.
- Téléphone : `tel:5556820573`, affiché comme `+52 (55) 5682 0573`.
- Email : `mailto:info@estenio.com.mx`.
- Adresse : lien source conservé vers `https://maps.app.goo.gl/UGFv7zfEMZZSfXzS6`.

## Points restant à confirmer

- Le sitemap WordPress et toute URL non liée depuis la navigation n’ont pas pu être lus à cause de la réponse HTTP 406 ; une exportation XML ou un accès WordPress permettra de fermer cet écart.
- Le formulaire, WhatsApp/Joinchat et les analytics ne sont pas connectés dans cette prévisualisation, conformément au brief.
- Le site source comporte des métadonnées `index, follow`; Astro conserve volontairement `noindex,nofollow` tant qu’un lancement en production n’est pas autorisé.
- Les redirections 301 ne sont pas nécessaires pour les six routes inventoriées, car les chemins sont conservés. Toute URL supplémentaire découverte via le sitemap devra être ajoutée avant publication.
