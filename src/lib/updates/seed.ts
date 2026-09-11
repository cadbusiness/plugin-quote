import type { ProductUpdate } from "./load";
import { latestVersion, sortByVersionDesc, unreadCount } from "./unread";
import type { ProductUpdatesSnapshot } from "./load";

/** Same notes as `0024` + `0025` + `0026` + `0027` + `0028` + `0029` + `0030` + `0031` + `0032` + `0033` migrations. Used when the table is not applied yet. */
export const BUNDLED_UPDATES: ProductUpdate[] = sortByVersionDesc([
  {
    id: "seed-1.13.1",
    version: "1.13.1",
    title: "Liens boutique vers le devis restent dans la vitrine",
    items: [
      "Les anciens liens vers le funnel /c/… avec indication boutique redirigent vers le devis intégré /b/…/devis (boutique publiée et liée).",
      "Les paramètres utiles (produit, UTM, etc.) sont conservés.",
      "Sans boutique (ou boutique inconnue / non publiée / non liée), le funnel /c/ reste inchangé.",
    ],
    releasedAt: "2026-09-11",
    createdAt: "2026-09-11T00:00:00.000Z",
  },
  {
    id: "seed-1.13.0",
    version: "1.13.0",
    title: "Catalogue boutique = seule source du devis intégré",
    items: [
      "Sur /b/…/devis, produits, suggestions et parcours viennent uniquement du catalogue relié à cette boutique.",
      "Plus de mélange avec le catalogue d’une autre boutique ou d’un funnel org-wide.",
      "Catalogue manquant ou inactif : message clair « Catalogue de cette boutique introuvable. ».",
      "Les parcours /c/ (hors boutique) restent inchangés.",
    ],
    releasedAt: "2026-09-11",
    createdAt: "2026-09-11T00:00:00.000Z",
  },
  {
    id: "seed-1.12.0",
    version: "1.12.0",
    title: "Funnel devis aux couleurs de la boutique",
    items: [
      "Sur /b/…/devis, le parcours de devis reprend l’accent, le fond et le texte de la vitrine.",
      "Boutons (Continuer, Envoyer, Chat, Sauvegarder, Voir le devis) et chrome d’étapes suivent le thème boutique.",
      "Le catalogue intégré utilise aussi les accents de la boutique.",
      "Les parcours /c/, embed et CRM restent inchangés (thème funnel classique).",
    ],
    releasedAt: "2026-09-11",
    createdAt: "2026-09-11T00:00:00.000Z",
  },
  {
    id: "seed-1.11.0",
    version: "1.11.0",
    title: "Devis intégré dans la boutique",
    items: [
      "Sur la vitrine publique, « Devis » et « Ajouter au devis » restent dans la boutique (/b/…/devis) au lieu d’ouvrir le funnel /c/….",
      "La page devis garde le chrome boutique (nav, thème --shop-*).",
      "Sans configurateur relié : message clair + lien vers le catalogue (plus de crash).",
      "Sitemap, JSON-LD produit et llms.txt pointent vers l’URL devis de la boutique.",
    ],
    releasedAt: "2026-09-11",
    createdAt: "2026-09-11T00:00:00.000Z",
  },
  {
    id: "seed-1.10.0",
    version: "1.10.0",
    title: "Templates boutique par secteur",
    items: [
      "Trois bases prêtes à l’emploi : menuiserie, soins (skincare) et stock B2B.",
      "Chaque template a son thème, son rythme de page et ses textes métier.",
      "Choix du modèle dans la boîte de création de boutique (cartes dédiées + autres secteurs).",
      "Le Chat IA reprend le vocabulaire et les images du template choisi.",
      "La boutique reste en demande de devis (pas de checkout).",
    ],
    releasedAt: "2026-09-11",
    createdAt: "2026-09-11T00:00:00.000Z",
  },
  {
    id: "seed-1.9.3",
    version: "1.9.3",
    title: "Inspecteur boutique : padding et marges appliqués",
    items: [
      "Padding et marge saisis dans l’inspecteur s’appliquent enfin sur le canvas (les nombres sans unité deviennent des px).",
      "Steppers +/− pour padding, marge, taille, graisse, top, left, z-index, arrondi, hauteur min et gutter.",
      "Les styles de l’inspecteur passent devant les presets vitrine (police, couleur, graisse).",
      "Saisie au clavier inchangée ; les steppers ajustent au clic.",
    ],
    releasedAt: "2026-09-11",
    createdAt: "2026-09-11T00:00:00.000Z",
  },
  {
    id: "seed-1.9.2",
    version: "1.9.2",
    title: "Menu mobile boutique publique réparé",
    items: [
      "Sur téléphone, le menu hamburger de la vitrine s’ouvre en plein écran (plus de tiroir coupé).",
      "Tous les liens (Accueil, Catalogue, etc.) restent visibles et utilisables, y compris avec encoche.",
      "Zones de tap plus confortables sur les liens empilés.",
      "Moins de défilement latéral accidentel sur la page boutique.",
    ],
    releasedAt: "2026-09-11",
    createdAt: "2026-09-11T00:00:00.000Z",
  },
  {
    id: "seed-1.9.1",
    version: "1.9.1",
    title: "Boutiques Chat IA : lien public dès la création",
    items: [
      "Après le premier échange avec le Chat IA, la boutique est publiée automatiquement.",
      "L’URL publique /b/… fonctionne tout de suite (plus de page introuvable en brouillon).",
      "Création depuis un modèle : reste en brouillon jusqu’au bouton Publier.",
      "La vitrine publique est rafraîchie à chaque sauvegarde, publication ou message Chat IA.",
    ],
    releasedAt: "2026-09-11",
    createdAt: "2026-09-11T00:00:00.000Z",
  },
  {
    id: "seed-1.9.0",
    version: "1.9.0",
    title: "Notes de version dans le dashboard",
    items: [
      "Nouvelle page Support → Mises à jour pour parcourir les nouveautés produit.",
      "Un badge non lu apparaît dans le menu Support jusqu’à l’ouverture.",
      "Accès aussi depuis Paramètres.",
      "Les versions non lues affichent une pastille « Nouveau ».",
    ],
    releasedAt: "2026-09-11",
    createdAt: "2026-09-11T00:00:00.000Z",
  },
  {
    id: "seed-1.8.0",
    version: "1.8.0",
    title: "Confirmation et brief T+0",
    items: [
      "Les templates confirmation prospect et brief commercial sont créés pour chaque espace, y compris les existants.",
      "Le parcours demande envoie l’email T+0 même si ces templates manquaient.",
    ],
    releasedAt: "2026-09-11",
    createdAt: "2026-09-11T00:00:00.000Z",
  },
  {
    id: "seed-1.7.0",
    version: "1.7.0",
    title: "Automatisations plus fiables",
    items: [
      "Un changement de statut peut relancer le parcours sur la même demande.",
      "L’abandon tient compte des heures, pas seulement des minutes.",
      "Un devis gagné ou perdu arrête le parcours.",
    ],
    releasedAt: "2026-09-10",
    createdAt: "2026-09-10T00:00:00.000Z",
  },
]);

export const UPDATES_SEEN_COOKIE = "qb-updates-seen";

export function snapshotFromEntries(
  entries: ProductUpdate[],
  lastSeenVersion: string | null,
  source: ProductUpdatesSnapshot["source"],
): ProductUpdatesSnapshot {
  return {
    entries,
    lastSeenVersion,
    latest: latestVersion(entries),
    unread: unreadCount(entries, lastSeenVersion),
    source,
  };
}
