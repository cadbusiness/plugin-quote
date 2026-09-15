import assert from "node:assert/strict";
import { emptyMemberBlock, MEMBER_BLOCK_LABEL, resourcesOfKind } from "./blocks";
import { buildMemberSpaceBlueprint, parseCreateMemberSpaceForm } from "./create";
import {
  DEFAULT_MEMBER_THEME,
  memberStatusAfterArchiveToggle,
  parseBlock,
  parseBlocks,
  parsePageKind,
  parseStatus,
  parseTheme,
} from "./parse";
import { memberPagePath, memberSpaceAbsoluteUrl, memberSpaceBasePath, uniqueMemberPageSlug } from "./urls";

const blueprint = buildMemberSpaceBlueprint({
  name: "Espace devis Atelier Nord",
  orgName: "Atelier Nord",
  includeDocuments: true,
  includePlugins: true,
});

assert.equal(blueprint.pages[0]?.kind, "home");
assert.equal(blueprint.pages[1]?.kind, "quotes");
assert.ok(blueprint.pages.some((page) => page.kind === "documents"));
assert.ok(blueprint.pages[0]?.blocks.some((block) => block.type === "quotes"));
assert.ok(blueprint.pages[0]?.blocks.some((block) => block.type === "documents"));
assert.ok(blueprint.pages[0]?.blocks.some((block) => block.type === "plugins"));
assert.ok(blueprint.resources.some((item) => item.kind === "document"));
assert.ok(blueprint.resources.some((item) => item.kind === "plugin"));

const slim = buildMemberSpaceBlueprint({
  name: "Espace",
  orgName: "Nord",
  includeDocuments: false,
  includePlugins: false,
});
assert.equal(
  slim.pages.some((page) => page.kind === "documents"),
  false,
);
assert.equal(slim.resources.length, 0);
assert.ok(slim.pages[0]?.blocks.every((block) => block.type !== "documents"));

const form = parseCreateMemberSpaceForm(
  (() => {
    const data = new FormData();
    data.set("name", "Espace clients");
    data.set("documents", "on");
    return data;
  })(),
);
assert.equal(form?.includeDocuments, true);
assert.equal(form?.includePlugins, false);
assert.equal(parseCreateMemberSpaceForm(new FormData()), null);

const hero = emptyMemberBlock("hero");
assert.equal(hero.type, "hero");
assert.ok(hero.heading);
assert.equal(parseBlock({ type: "unknown" }), null);
assert.equal(parseBlocks([{ type: "text", heading: "A" }])[0]?.heading, "A");
assert.equal(parsePageKind("quotes"), "quotes");
assert.equal(parsePageKind("nope"), "custom");
assert.equal(parseStatus("published"), "published");
assert.equal(memberStatusAfterArchiveToggle("published", "2026-01-01"), "archived");
assert.equal(memberStatusAfterArchiveToggle("archived", "2026-01-01"), "published");
assert.equal(memberStatusAfterArchiveToggle("archived", null), "draft");

const theme = parseTheme({ accent: "#111111" });
assert.equal(theme.accent, "#111111");
assert.equal(theme.background, DEFAULT_MEMBER_THEME.background);
assert.equal(MEMBER_BLOCK_LABEL.quotes, "Mes devis");

const docs = resourcesOfKind(
  [
    { id: "1", kind: "document", title: "A", description: "", href: "/a", isPublished: true, sortOrder: 0 },
    { id: "2", kind: "plugin", title: "B", description: "", href: "/b", isPublished: true, sortOrder: 1 },
    { id: "3", kind: "link", title: "C", description: "", href: "/c", isPublished: false, sortOrder: 2 },
  ],
  "plugin",
);
assert.equal(docs.length, 1);
assert.equal(docs[0]?.kind, "plugin");

assert.equal(memberSpaceBasePath("demo", "espace"), "/m/demo/espace");
assert.equal(memberSpaceAbsoluteUrl("https://www.quotebuilder.co", "demo", "espace"), "https://www.quotebuilder.co/m/demo/espace");
assert.equal(memberPagePath("accueil"), "/");
assert.equal(memberPagePath("devis"), "/devis");
assert.equal(
  uniqueMemberPageSlug(
    [
      { id: "a", slug: "accueil" },
      { id: "b", slug: "devis" },
    ],
    "Nouvelle page",
  ),
  "nouvelle-page",
);
assert.equal(uniqueMemberPageSlug([], "  "), "page");
assert.equal(uniqueMemberPageSlug([{ id: "a", slug: "accueil" }], "Accueil"), "accueil-2");
assert.equal(
  uniqueMemberPageSlug(
    [
      { id: "a", slug: "accueil" },
      { id: "c", slug: "nouvelle-page" },
    ],
    "Nouvelle page",
  ),
  "nouvelle-page-2",
);

console.log("members ok");
