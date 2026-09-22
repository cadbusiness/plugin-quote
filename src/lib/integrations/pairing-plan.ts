import { normalizeSiteUrl } from "@/lib/integrations/woocommerce";

export type WooPairingRow = {
  id: string;
  store_domain: string;
};

export type WooPairingPlan =
  | { action: "insert" }
  | { action: "update"; connectionId: string };

/**
 * Une org avec une seule connexion WooCommerce réutilise cette ligne
 * quand le plugin se reconnecte depuis une autre URL (clone Hostinger,
 * changement de domaine). Les produits restent sur le même `connection_id`
 * et se fusionnent par `external_id`. Deux boutiques distinctes ne sont pas fusionnées.
 */
export function planWooPairing(existing: WooPairingRow[], siteUrl: string): WooPairingPlan {
  const normalized = normalizeSiteUrl(siteUrl);
  const same = existing.find((row) => domainsMatch(row.store_domain, normalized));
  if (same) return { action: "update", connectionId: same.id };
  if (existing.length === 1) return { action: "update", connectionId: existing[0].id };
  return { action: "insert" };
}

export function domainsMatch(left: string, right: string) {
  try {
    return normalizeSiteUrl(left) === normalizeSiteUrl(right);
  } catch {
    return left.replace(/\/+$/, "") === right.replace(/\/+$/, "");
  }
}

/** Au-delà, une ligne `running` est une synchro tuée par le timeout serveur. */
export const STALE_SYNC_MS = 6 * 60 * 1000;

export function isStaleRunning(startedAt: string, now = Date.now(), maxMs = STALE_SYNC_MS) {
  const started = new Date(startedAt).getTime();
  return Number.isFinite(started) && now - started > maxMs;
}

export function staleSyncCutoff(now = Date.now(), maxMs = STALE_SYNC_MS) {
  return new Date(now - maxMs).toISOString();
}
