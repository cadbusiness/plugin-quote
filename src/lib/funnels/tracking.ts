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
