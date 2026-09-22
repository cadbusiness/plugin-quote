import type { Metadata } from "next";
import { getAppUrl } from "@/lib/supabase/env";

/** Marketing homepage slogan. Merchant pages must not inherit it. */
export const MARKETING_SLOGAN = "Arrêtez de perdre vos devis";

export function merchantConfiguratorMetadata(input: {
  orgName: string;
  funnelName: string;
  /** Public path, always `/c/…` even when the request is the embed. */
  path: string;
  embedded?: boolean;
}): Metadata {
  const orgName = input.orgName.trim() || "Devis";
  const funnelName = input.funnelName.trim() || "Devis";
  const title = funnelName === orgName ? funnelName : `${funnelName} · ${orgName}`;
  const description = `Demande de devis ${funnelName} — ${orgName}.`;
  const url = `${getAppUrl()}${input.path.startsWith("/") ? input.path : `/${input.path}`}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: input.embedded
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url,
      siteName: orgName,
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
