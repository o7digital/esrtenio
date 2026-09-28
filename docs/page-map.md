# Inventaire de migration Estenio

Inventaire réalisé le 27 septembre 2026 depuis la navigation, les liens internes et le sitemap sur `https://estenio.com.mx/`. Après des réponses 406 initiales, `robots.txt`, `sitemap_index.xml` et `page-sitemap.xml` ont été lus avec succès : le sitemap liste exactement les six pages ci-dessous. L’inventaire détaillé des liens et métadonnées figure dans `audit/source-inventory.json`.

| URL source | URL Astro | Contenu migré | Métadonnées | État |
| --- | --- | --- | --- | --- |
| `/` | `/` | Vidéo originale, quatre services et leurs photos, deux services de pension, Nosotros et sa photo, dix logos clients, contact | Titre, description, Open Graph et canonical source | Migré |
| `/nosotros/` | `/nosotros/` | Histoire et ses deux photos, huit valeurs avec leurs icônes, photo d’équipe et 16 portraits, phrase de clôture, contact | Titre, Open Graph et canonical source ; description SEO absente du source | Migré |
| `/auditoria/` | `/auditoria/` | Présentation, cinq onglets complets et 18 cartes de services avec leurs médias et contenus recto/verso | Titre, Open Graph et canonical source ; description SEO absente du source | Migré |
| `/legal/` | `/legal/` | Présentation, cinq blocs détaillés et 12 services complémentaires | Titre source et description source reprise | Migré |
| `/asesoria-infonavit/` | `/asesoria-infonavit/` | Présentation et image, méthode en cinq étapes, webinar, quatre accordéons et image des services | Titre, Open Graph et canonical source ; description SEO absente du source | Migré |
| `/gestor-de-pensiones/` | `/gestor-de-pensiones/` | Trois onglets, trois blocs illustrés, webinar, trois témoignages et leurs portraits, 13 questions/réponses complètes | Titre, description, Open Graph et canonical source | Migré |
| `/pension/` | `/gestor-de-pensiones/` | Lien présent dans trois boutons de l’accueil mais retournant 404 sur WordPress | Redirection HTTP 301 Vercel, alias Astro | Réparé |
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

- Les six routes publiques du sitemap sont migrées ; aucune page supplémentaire ni mention légale distincte n’est liée dans l’inventaire public.
- Le formulaire, WhatsApp/Joinchat et les analytics ne sont pas connectés dans cette prévisualisation, conformément au brief.
- Le site source comporte des métadonnées `index, follow`; Astro conserve volontairement `noindex,nofollow` tant qu’un lancement en production n’est pas autorisé.
- Les chemins des six pages sont conservés. Seul le lien source cassé `/pension/` est redirigé vers `/gestor-de-pensiones/` ; les destinations des boutons source sont laissées intactes dans le HTML.

## Validation de la correction

- `audit/visual-report.json` : 24 contrôles responsive, comparaison exacte des fragments source (titres, paragraphes, cartes recto/verso, onglets, accordéons, témoignages et boutons) et contrôle du mode statique sans téléchargement MP4.
- Captures source et correction aux largeurs 390, 768, 1440 et 1920 px ; inspection visuelle du hero, de Nosotros et des clients. Les captures de livraison sont accessibles sur `/review/`.
- Les dix fichiers de logos clients sont complets et conservent leurs couleurs. Le symbole et le nom du SVG Nosotros, ainsi que les logos du header/footer, sont affichés sans recadrage.
- Le formulaire reste à connecter au backend/CRM/email. WhatsApp et analytics restent volontairement désactivés sur la prévisualisation. Aucun script HubSpot n’a été trouvé dans les pages publiques auditées ; confirmer une éventuelle intégration côté WordPress avant connexion.
