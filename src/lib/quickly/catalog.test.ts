import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const seedSource = readFileSync(new URL("./seed.ts", import.meta.url), "utf8");
const cliSource = readFileSync(new URL("./cli.ts", import.meta.url), "utf8");
const cleanup = readFileSync(
  new URL("../../../supabase/migrations/0046_retire_quickly_handmade_skus.sql", import.meta.url),
  "utf8",
);

assert.equal(/resend|sendTemplateEmail|inviteMember|generateLink|auth\.admin/i.test(seedSource + cliSource), false);
assert.equal(/\.from\(\s*["']products["']\s*\)|\.insert\(/.test(seedSource), false);
assert.match(seedSource, /est retiré/);
assert.match(cleanup, /connection_id is null/);
assert.match(cleanup, /source = 'manual'/);
assert.equal(/delete\s+from\s+public\.products(?![\s\S]{0,400}connection_id is null)/i.test(cleanup), false);
assert.doesNotMatch(cleanup, /QB-QCK-UNIRACK[\s\S]{0,80}connection_id is not null/i);

console.log("quickly seed retired");
