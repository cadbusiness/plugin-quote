import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getAppUrl } from "@/lib/supabase/env";

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
  version: "2.1.0",
  requires: "6.0",
  requires_php: "7.4",
  tested: "6.8",
  author: "Vinci Liberta LTD",
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
  return {
    slug: release.slug,
    name: release.name,
    version: release.version,
    new_version: release.version,
    requires: release.requires,
    requires_php: release.requires_php,
    tested: release.tested,
    author: release.author,
    homepage: release.homepage || app,
    package: `${app}/api/public/plugin/wordpress/download`,
    download_url: `${app}/api/public/plugin/wordpress/download`,
    last_updated: new Date().toISOString().slice(0, 10),
    sections: {
      description:
        "Vitrine devis QuoteBuilder pour WooCommerce : masquer les prix, liste de devis, funnel.",
      changelog: release.changelog || `<h4>${release.version}</h4><p>Mise à jour du plugin QuoteBuilder.</p>`,
    },
    banners: {},
  };
}
