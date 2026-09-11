import assert from "node:assert/strict";
import { compareSemver, isSemver, parseSemver, releaseLabel } from "./semver";
import { formatReleaseDate, parseItems } from "./load";
import { isUnreadVersion, latestVersion, sortByVersionDesc, unreadCount } from "./unread";

assert.equal(isSemver("1.8.0"), true);
assert.equal(isSemver("1.8"), false);
assert.equal(isSemver("v1.8.0"), false);
assert.deepEqual(parseSemver("1.8.1"), { major: 1, minor: 8, patch: 1 });
assert.equal(parseSemver("nope"), null);

assert.ok(compareSemver("1.8.0", "1.7.0") > 0);
assert.ok(compareSemver("1.7.9", "1.8.0") < 0);
assert.equal(compareSemver("1.8.0", "1.8.0"), 0);
assert.ok(compareSemver("2.0.0", "1.99.99") > 0);
assert.ok(compareSemver("1.8.0", "bad") > 0);

assert.equal(releaseLabel("1.8.0"), "1.8");
assert.equal(releaseLabel("1.8.1"), "1.8.1");
assert.equal(releaseLabel("oops"), "oops");

const entries = [{ version: "1.7.0" }, { version: "1.8.0" }, { version: "1.6.2" }];
assert.deepEqual(
  sortByVersionDesc(entries).map((entry) => entry.version),
  ["1.8.0", "1.7.0", "1.6.2"],
);
assert.equal(latestVersion(entries), "1.8.0");
assert.equal(latestVersion([]), null);

assert.equal(unreadCount(entries, null), 3);
assert.equal(unreadCount(entries, "1.7.0"), 1);
assert.equal(unreadCount(entries, "1.8.0"), 0);
assert.equal(isUnreadVersion("1.8.0", "1.7.0"), true);
assert.equal(isUnreadVersion("1.7.0", "1.7.0"), false);
assert.equal(isUnreadVersion("1.6.2", "1.7.0"), false);

assert.deepEqual(parseItems(["Puce 1.", "Puce 2.", 3, "", null] as never), ["Puce 1.", "Puce 2."]);
assert.deepEqual(parseItems({ nope: true }), []);
const dated = formatReleaseDate("2026-09-11");
assert.ok(dated && dated.includes("2026") && dated.includes("11"));
assert.equal(formatReleaseDate(null), null);

async function testLoadSnapshot() {
  const rows = [
    {
      id: "a",
      version: "1.7.0",
      title: "Ancien",
      items: ["Puce."],
      released_at: "2026-09-10",
      created_at: "2026-09-10T00:00:00Z",
    },
    {
      id: "b",
      version: "1.8.0",
      title: "Récent",
      items: ["Autre."],
      released_at: "2026-09-11",
      created_at: "2026-09-11T00:00:00Z",
    },
  ];
  const client = {
    from(table: string) {
      if (table === "product_updates") {
        return { select: () => Promise.resolve({ data: rows, error: null }) };
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: { last_seen_version: "1.7.0" }, error: null }),
          }),
        }),
      };
    },
  };
  const { loadProductUpdates } = await import("./load");
  const snapshot = await loadProductUpdates(client as never, "user-1");
  assert.equal(snapshot.source, "db");
  assert.equal(snapshot.latest, "1.8.0");
  assert.equal(snapshot.unread, 1);
  assert.equal(snapshot.entries[0]?.title, "Récent");

  const missing = {
    from() {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: { message: "missing" } }),
          }),
          then(resolve: (value: unknown) => unknown) {
            return Promise.resolve(resolve({ data: null, error: { message: "missing" } }));
          },
        }),
      };
    },
  };
  const empty = await loadProductUpdates(missing as never, "user-1");
  assert.equal(empty.source, "missing");
  assert.equal(empty.unread, 0);
  assert.equal(empty.entries.length, 0);

  const { resolveProductUpdates } = await import("./resolve");
  const { BUNDLED_UPDATES } = await import("./seed");
  const bundled = await resolveProductUpdates(missing as never, "user-1", "1.7.0");
  assert.equal(bundled.source, "missing");
  assert.equal(bundled.unread, 7);
  assert.equal(bundled.latest, "1.11.0");
  assert.ok(BUNDLED_UPDATES.some((entry) => entry.version === "1.11.0"));
}

testLoadSnapshot()
  .then(() => {
    console.log("updates/unread ok");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
