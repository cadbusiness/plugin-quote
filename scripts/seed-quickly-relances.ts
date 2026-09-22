import { existsSync, readFileSync } from "node:fs";
import { createServiceClient } from "@/lib/supabase/service";
import { seedQuicklySilentDrafts } from "@/lib/workflows/quickly-drafts";

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

loadLocalEnv();

async function main() {
  const pauseActive = process.argv.includes("--pause-active");
  const result = await seedQuicklySilentDrafts(createServiceClient(), { pauseActive });
  if (!result.ok) {
    console.error(result.reason);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        inserted: result.inserted,
        paused: result.paused,
        drafts: result.drafts,
        emailed: false,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
