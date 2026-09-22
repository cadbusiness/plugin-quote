import { existsSync, readFileSync } from "node:fs";
import { createServiceClient } from "@/lib/supabase/service";
import { seedQuicklyCatalog } from "@/lib/quickly/seed";

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
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (process.env[key] == null || process.env[key] === "") process.env[key] = value;
    }
  }
}

async function main() {
  loadLocalEnv();
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`Upsert le catalogue Quickly (slug quickly, funnel rayonnage).

Aucun e-mail n’est envoyé.

Usage:
  npm run seed:quickly

Env requis:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
`);
    return;
  }

  const result = await seedQuicklyCatalog(createServiceClient());
  console.log(
    `quickly: ${result.upserted} produits, ${result.deactivated} fiches génériques retirées, ${result.rules} règles mises à jour`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
