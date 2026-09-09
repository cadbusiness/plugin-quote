import type { Json } from "@/lib/db/database.types";

export type FunnelTracking = {
  ga: string;
  metaPixel: string;
  gtm: string;
};

export function parseFunnelTracking(theme: Json | null | undefined): FunnelTracking {
  if (!theme || typeof theme !== "object" || Array.isArray(theme)) {
    return { ga: "", metaPixel: "", gtm: "" };
  }
  const raw = (theme as { tracking?: unknown }).tracking;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ga: "", metaPixel: "", gtm: "" };
  }
  const row = raw as Record<string, unknown>;
  return {
    ga: typeof row.ga === "string" ? row.ga : "",
    metaPixel: typeof row.metaPixel === "string" ? row.metaPixel : "",
    gtm: typeof row.gtm === "string" ? row.gtm : "",
  };
}

export function mergeFunnelTracking(theme: Json | null | undefined, tracking: FunnelTracking): Json {
  const base =
    theme && typeof theme === "object" && !Array.isArray(theme) ? { ...(theme as Record<string, unknown>) } : {};
  return {
    ...base,
    tracking: {
      ga: tracking.ga.trim() || undefined,
      metaPixel: tracking.metaPixel.trim() || undefined,
      gtm: tracking.gtm.trim() || undefined,
    },
  } as Json;
}

export function parseOrgGtm(branding: Json | null | undefined): string {
  if (!branding || typeof branding !== "object" || Array.isArray(branding)) return "";
  const gtm = (branding as { gtm?: unknown }).gtm;
  return typeof gtm === "string" ? gtm.trim() : "";
}

export function mergeOrgGtm(branding: Json | null | undefined, gtm: string): Json {
  const base =
    branding && typeof branding === "object" && !Array.isArray(branding)
      ? { ...(branding as Record<string, unknown>) }
      : {};
  const next = gtm.trim();
  if (next) return { ...base, gtm: next } as Json;
  const rest = { ...base };
  delete rest.gtm;
  return rest as Json;
}

export function normalizeGaId(raw: string): string | null {
  const value = raw.trim().toUpperCase();
  if (!value) return "";
  return /^G-[A-Z0-9]+$/.test(value) ? value : null;
}

export function normalizeGtmId(raw: string): string | null {
  const value = raw.trim().toUpperCase();
  if (!value) return "";
  return /^GTM-[A-Z0-9]+$/.test(value) ? value : null;
}
