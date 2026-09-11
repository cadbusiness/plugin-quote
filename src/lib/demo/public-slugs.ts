import type { Json } from "@/lib/db/database.types";
import { parseFunnelKind } from "@/lib/funnels/kind";
import {
  DEMO_FUNNEL_ALIASES,
  DEMO_FUNNEL_SLUG,
  DEMO_ORG,
  DEMO_SHOP_ALIASES,
  DEMO_SHOP_SLUG,
} from "@/lib/demo/constants";

export { DEMO_FUNNEL_ALIASES, DEMO_FUNNEL_SLUG, DEMO_SHOP_ALIASES, DEMO_SHOP_SLUG };

function unique(slugs: string[]) {
  return [...new Set(slugs.filter(Boolean))];
}

/** Slugs to try for a public configurator URL. Aliases apply only to org `demo`. */
export function publicConfiguratorSlugs(orgSlug: string, requested: string): string[] {
  if (orgSlug !== DEMO_ORG.slug) return [requested];
  if (!(DEMO_FUNNEL_ALIASES as readonly string[]).includes(requested)) return [requested];
  return unique([requested, DEMO_FUNNEL_SLUG, ...DEMO_FUNNEL_ALIASES]);
}

/** Slugs to try for a public shop URL. Aliases apply only to org `demo`. */
export function publicShopSlugs(orgSlug: string, requested: string): string[] {
  if (orgSlug !== DEMO_ORG.slug) return [requested];
  if (!(DEMO_SHOP_ALIASES as readonly string[]).includes(requested)) return [requested];
  return unique([requested, DEMO_SHOP_SLUG, ...DEMO_SHOP_ALIASES]);
}

export function pickPreferredBySlug<T extends { slug: string }>(
  rows: T[] | null | undefined,
  preference: readonly string[],
): T | null {
  if (!rows?.length) return null;
  for (const slug of preference) {
    const hit = rows.find((row) => row.slug === slug);
    if (hit) return hit;
  }
  return rows[0] ?? null;
}

type FunnelKindRow = {
  slug: string;
  wizard_enabled?: boolean | null;
  chat_enabled?: boolean | null;
  theme?: Json | null;
};

/** Prefer the advertised form/chat funnel, never a catalogue-* vitrine. */
export function pickDemoFunnel<T extends FunnelKindRow>(rows: T[] | null | undefined): T | null {
  const usable = (rows ?? []).filter((row) => {
    if (row.slug.startsWith("catalogue-")) return false;
    return parseFunnelKind(row.theme, Boolean(row.wizard_enabled), Boolean(row.chat_enabled)) !== "catalog";
  });
  return pickPreferredBySlug(usable, DEMO_FUNNEL_ALIASES);
}
