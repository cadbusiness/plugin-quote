import assert from "node:assert/strict";
import { MARKETING_SLOGAN, merchantConfiguratorMetadata } from "./public-meta";

function absoluteTitle(meta: ReturnType<typeof merchantConfiguratorMetadata>) {
  const title = meta.title;
  assert.equal(title && typeof title === "object" && "absolute" in title, true);
  return (title as { absolute: string }).absolute;
}

const meta = merchantConfiguratorMetadata({
  orgName: "Quickly International",
  funnelName: "Rayonnage industriel",
  path: "/c/quickly/rayonnage",
});
const embedded = merchantConfiguratorMetadata({
  orgName: "Quickly International",
  funnelName: "Rayonnage industriel",
  path: "/c/quickly/rayonnage",
  embedded: true,
});

const title = absoluteTitle(meta);
assert.equal(title, "Rayonnage industriel · Quickly International");
assert.equal(title.includes(MARKETING_SLOGAN), false);
assert.equal(meta.description?.includes(MARKETING_SLOGAN), false);
assert.equal(JSON.stringify(embedded).includes(MARKETING_SLOGAN), false);
assert.match(String(meta.alternates && "canonical" in meta.alternates ? meta.alternates.canonical : ""), /\/c\/quickly\/rayonnage$/);
assert.equal(embedded.robots && typeof embedded.robots === "object" && "index" in embedded.robots ? embedded.robots.index : true, false);
assert.equal(meta.openGraph?.siteName, "Quickly International");

console.log("public-meta.test.ts ok");
