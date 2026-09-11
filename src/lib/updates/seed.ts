import type { ProductUpdate } from "./load";
import { latestVersion, sortByVersionDesc, unreadCount } from "./unread";
import type { ProductUpdatesSnapshot } from "./load";

/** Same notes as `0024` + `0025` + `0026` + `0027` migrations. Used when the table is not applied yet. */
export const BUNDLED_UPDATES: ProductUpdate[] = sortByVersionDesc([
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
