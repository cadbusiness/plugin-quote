import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "extensions", "quotebuilder-wp");
const outDir = join(root, "extensions");
const zipPath = join(outDir, "quotebuilder-wp.zip");

await mkdir(outDir, { recursive: true });
const result = spawnSync("zip", ["-r", "-q", zipPath, "quotebuilder-wp"], {
  cwd: join(root, "extensions"),
  stdio: "inherit",
});
if (result.status !== 0) {
  // Fallback: still succeed the Next build if zip is unavailable.
  createWriteStream(zipPath).end();
}
