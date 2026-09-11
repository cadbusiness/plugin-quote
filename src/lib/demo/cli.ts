import { existsSync, readFileSync } from "node:fs";
import { createServiceClient } from "@/lib/supabase/service";
import { DEMO_ACCOUNTS, DEMO_OWNER_EMAIL, DEMO_ORG, demoPasswordFromEnv } from "@/lib/demo/constants";
import { runDemoSeed } from "@/lib/demo/seed";
import { SEED_MODULES } from "@/lib/demo/registry";

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

function parseOnly(argv: string[]) {
  const raw = argv.find((arg) => arg.startsWith("--only="));
  if (!raw) return undefined;
  return raw
    .slice("--only=".length)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function printMagicLink(email: string) {
  const supabase = createServiceClient();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.quotebuilder.co").replace(/\/$/, "");
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${appUrl}/accueil` },
  });
  if (error || !data.properties?.action_link) {
    throw error ?? new Error("Impossible de générer le lien magique");
  }
  console.log(data.properties.action_link);
}

async function main() {
  loadLocalEnv();
  const argv = process.argv.slice(2);

  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(`Seed org démo QuoteBuilder (slug ${DEMO_ORG.slug}, v modules).

Usage:
  npm run seed:demo
  npm run seed:demo -- --only=catalog,quotes
  npm run seed:demo -- --print-magic-link
  npm run seed:demo -- --print-magic-link --email=demo@quotebuilder.app

Env requis:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  DEMO_PASSWORD          (jamais committer)

Optionnel:
  NEXT_PUBLIC_APP_URL
  NEXT_PUBLIC_DEMO_PASSWORD  (active le one-click sur /login)

Modules: ${SEED_MODULES.map((module) => module.id).join(", ")}
`);
    return;
  }

  if (argv.includes("--print-magic-link")) {
    const emailArg = argv.find((arg) => arg.startsWith("--email="));
    const email = emailArg ? emailArg.slice("--email=".length) : DEMO_OWNER_EMAIL;
    await printMagicLink(email);
    return;
  }

  if (!demoPasswordFromEnv()) {
    throw new Error(
      "DEMO_PASSWORD manquant. Ex. : DEMO_PASSWORD='…' npm run seed:demo  — voir docs/demo-org.md",
    );
  }

  const supabase = createServiceClient();
  const report = await runDemoSeed(supabase, { only: parseOnly(argv) });
  console.log(`Org ${report.orgSlug} (${report.orgId}) seed v${report.version}`);
  for (const row of report.modules) {
    console.log(`  [${row.action}] ${row.module} — ${row.detail}`);
  }
  console.log("Comptes (mot de passe = DEMO_PASSWORD, non affiché) :");
  for (const account of DEMO_ACCOUNTS) {
    console.log(`  ${account.email}  (${account.platform || account.role})`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
