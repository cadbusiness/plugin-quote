import { keywordPackForSector } from "@/lib/ads/keywords";
import { adsLandingUrl } from "@/lib/ads/utm";
import { shopQuotePath } from "@/lib/shops/urls";

export type AdsLandingKind = "funnel" | "shop" | "wordpress";

export type AdsLanding = {
  id: string;
  kind: AdsLandingKind;
  name: string;
  hint: string;
  sector: string;
  campaign: string;
  url: string;
  funnelId: string | null;
};

export const LANDING_KIND_LABEL: Record<AdsLandingKind, string> = {
  funnel: "Configurateur",
  shop: "Boutique",
  wordpress: "Site WordPress",
};

export function siteOrigin(storeDomain: string) {
  const trimmed = storeDomain.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    const path = url.pathname.replace(/\/+$/, "");
    return `${url.origin}${path}`;
  } catch {
    return null;
  }
}

export function wordpressQuotePageUrl(storeDomain: string, quotePageUrl?: string | null) {
  const explicit = (quotePageUrl ?? "").trim();
  if (explicit) {
    try {
      if (/^https?:\/\//i.test(explicit)) return new URL(explicit).toString();
      const base = siteOrigin(storeDomain);
      return base ? new URL(explicit, `${base}/`).toString() : null;
    } catch {
      /* fallback below */
    }
  }
  const base = siteOrigin(storeDomain);
  return base ? `${base}/demande-de-devis` : null;
}

export function hostnameOf(value: string) {
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).hostname;
  } catch {
    return value.replace(/^https?:\/\//i, "").split("/")[0] ?? value;
  }
}

function packFor(sector: string | null | undefined) {
  return keywordPackForSector(sector || "general");
}

export function buildAdsLandings(input: {
  origin: string;
  orgSlug: string;
  funnels: { id: string; name: string; slug: string; sector: string }[];
  shops: { id: string; name: string; slug: string; sector: string; status: string }[];
  wordpress: {
    id: string;
    label: string;
    storeDomain: string;
    quotePageUrl?: string | null;
    sector?: string | null;
  }[];
}): AdsLanding[] {
  const origin = input.origin.replace(/\/$/, "");
  const landings: AdsLanding[] = [];

  for (const funnel of input.funnels) {
    const pack = packFor(funnel.sector);
    landings.push({
      id: `funnel:${funnel.id}`,
      kind: "funnel",
      name: funnel.name,
      hint: "Le configurateur QuoteBuilder",
      sector: pack.sector,
      campaign: pack.campaignName,
      url: adsLandingUrl(`${origin}/c/${input.orgSlug}/${funnel.slug}`, pack.campaignName, funnel.slug),
      funnelId: funnel.id,
    });
  }

  for (const shop of input.shops) {
    if (shop.status !== "published") continue;
    const pack = packFor(shop.sector);
    const path = shopQuotePath(input.orgSlug, shop.slug);
    landings.push({
      id: `shop:${shop.id}`,
      kind: "shop",
      name: shop.name,
      hint: "La boutique — page devis",
      sector: pack.sector,
      campaign: pack.campaignName,
      url: adsLandingUrl(`${origin}${path}`, pack.campaignName, shop.slug),
      funnelId: null,
    });
  }

  for (const site of input.wordpress) {
    const page = wordpressQuotePageUrl(site.storeDomain, site.quotePageUrl);
    if (!page) continue;
    const pack = packFor(site.sector);
    const host = hostnameOf(site.storeDomain);
    landings.push({
      id: `wordpress:${site.id}`,
      kind: "wordpress",
      name: site.label || host,
      hint: `Le site ${host} — page demande de devis`,
      sector: pack.sector,
      campaign: pack.campaignName,
      url: adsLandingUrl(page, pack.campaignName, "devis"),
      funnelId: null,
    });
  }

  return landings;
}

export function campaignLanding(
  row: { funnelId: string | null; campaign: string },
  urls: AdsLanding[],
) {
  if (row.funnelId) {
    const byFunnel = urls.find((item) => item.funnelId === row.funnelId);
    if (byFunnel) return byFunnel;
  }
  return urls.find((item) => item.campaign === row.campaign) ?? null;
}
