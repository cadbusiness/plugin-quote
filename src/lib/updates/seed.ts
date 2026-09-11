import type { ProductUpdate } from "./load";
import { latestVersion, sortByVersionDesc, unreadCount } from "./unread";
import type { ProductUpdatesSnapshot } from "./load";

/** Same notes as `0024_product_updates.sql`. Used when the table is not applied yet. */
export const BUNDLED_UPDATES: ProductUpdate[] = sortByVersionDesc([
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
