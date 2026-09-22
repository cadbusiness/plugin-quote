import { existsSync, readFileSync } from "node:fs";
import { createServiceClient } from "@/lib/supabase/service";
import { retargetWooConnection } from "@/lib/integrations/retarget-woo";
import { runCatalogSync } from "@/lib/integrations/sync";

const ORG_SLUG = "quickly";

function loadLocalEnv() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const raw of readFileSync(file, "utf8").split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] == null || process.env[key] === "") process.env[key] = value;
    }
  }
}

function argValue(argv: string[], name: string) {
  const prefix = `--${name}=`;
  const found = argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length).trim() : "";
}

/**
 * Import WooCommerce de l'org `quickly` uniquement.
 * N'envoie aucun e-mail : `runCatalogSync` n'écrit que le catalogue.
 *
 *   SUPABASE_SERVICE_ROLE_KEY=… npm run sync:quickly-woo
 *   SUPABASE_SERVICE_ROLE_KEY=… npm run sync:quickly-woo -- --site=https://mintcream-mosquito-831101.hostingersite.com
 */
async function main() {
  loadLocalEnv();
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(`Sync catalogue Woo de l'org ${ORG_SLUG}. Aucun e-mail.

  npm run sync:quickly-woo
  npm run sync:quickly-woo -- --site=https://exemple.tld
  npm run sync:quickly-woo -- --connection=<uuid>

--site teste les clés REST déjà stockées avant de changer l'URL.
Si le test échoue, l'URL n'est pas modifiée.
`);
    return;
  }

  const site = argValue(argv, "site");
  const connectionId = argValue(argv, "connection");
  const supabase = createServiceClient();
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, slug, name")
    .eq("slug", ORG_SLUG)
    .maybeSingle();
  if (orgError || !org) {
    throw new Error(orgError?.message ?? `Organisation ${ORG_SLUG} introuvable.`);
  }

  let query = supabase
    .from("catalog_connections")
    .select("*")
    .eq("organization_id", org.id)
    .eq("provider", "woocommerce");
  if (connectionId) query = query.eq("id", connectionId);
  const { data: rows, error } = await query;
  if (error) throw new Error(error.message);
  if (!rows?.length) {
    throw new Error(
      "Aucune connexion WooCommerce. Dans WordPress, QuoteBuilder → Connecter la boutique.",
    );
  }
  if (rows.length > 1) {
    throw new Error("Plusieurs connexions Woo. Relancez avec --connection=<uuid>.");
  }

  let row = rows[0];
  if (site) {
    const aligned = await retargetWooConnection(supabase, row, site);
    if (aligned.error) throw new Error(aligned.error);
    row = aligned.row;
    if (aligned.changed) console.log(`URL boutique → ${row.store_domain}`);
  }

  const result = await runCatalogSync({ connectionId: row.id, trigger: "manual" });
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("connection_id", row.id)
    .eq("source", "woocommerce")
    .eq("is_active", true);
  console.log(
    JSON.stringify(
      {
        org: org.slug,
        connection_id: row.id,
        store_domain: row.store_domain,
        active_woo_products: count ?? 0,
        ...result,
      },
      null,
      2,
    ),
  );
  if (result.error) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
