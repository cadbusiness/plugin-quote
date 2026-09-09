import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getAppUrl } from "@/lib/supabase/env";
import { PUBLIC_APP_URL } from "@/lib/supabase/public-defaults";

export type WpPluginRelease = {
  slug: string;
  name: string;
  version: string;
  requires: string;
  requires_php: string;
  tested: string;
  author: string;
  homepage: string;
  changelog: string;
};

export const WP_PLUGIN_SLUG = "quotebuilder-wp";

const FALLBACK: WpPluginRelease = {
  slug: WP_PLUGIN_SLUG,
  name: "QuoteBuilder",
  version: "2.3.3",
  requires: "6.0",
  requires_php: "7.4",
  tested: "6.8",
  author: "QuoteBuilder",
  homepage: "",
  changelog: "",
};

export function wordpressPluginRelease(): WpPluginRelease {
  try {
    const raw = readFileSync(join(process.cwd(), "public", "quotebuilder-wp.json"), "utf8");
    const parsed = JSON.parse(raw) as Partial<WpPluginRelease>;
    return {
      ...FALLBACK,
      ...parsed,
      slug: parsed.slug || FALLBACK.slug,
      version: parsed.version || FALLBACK.version,
    };
  } catch {
    return FALLBACK;
  }
}

export function wordpressPluginUpdatePayload() {
  const release = wordpressPluginRelease();
  const app = getAppUrl().replace(/\/$/, "");
  const publicApp = !app || app.includes("localhost") ? PUBLIC_APP_URL : app;
  const icon = `${publicApp}/brand/quotebuilder-mark.png`;
  return {
    slug: release.slug,
    name: release.name,
    version: release.version,
    new_version: release.version,
    requires: release.requires,
    requires_php: release.requires_php,
    tested: release.tested,
    author: `<a href="${release.homepage || publicApp}">${release.author}</a>`,
    homepage: release.homepage || publicApp,
    package: `${publicApp}/api/public/plugin/wordpress/download`,
    download_url: `${publicApp}/api/public/plugin/wordpress/download`,
    last_updated: new Date().toISOString().slice(0, 10),
    sections: {
      description:
        "Vitrine devis QuoteBuilder pour WooCommerce : masquer les prix, liste de devis, funnel.",
      changelog: release.changelog || `<h4>${release.version}</h4><p>Mise à jour du plugin QuoteBuilder.</p>`,
    },
    icons: {
      "1x": icon,
      "2x": icon,
      default: icon,
    },
    banners: {},
  };
}
