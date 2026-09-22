import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { agentShortcode, agentWidgetSnippet, captureShortcode, captureWidgetSnippet } from "./capture-embed";

const snippet = captureWidgetSnippet("https://www.quotebuilder.co/", "quickly", "rayonnage");
assert.match(snippet, /data-module="capture"/);
assert.match(snippet, /data-org="quickly"/);
assert.match(snippet, /data-id="rayonnage"/);
assert.match(snippet, /src="https:\/\/www\.quotebuilder\.co\/widget\.js"/);
assert.equal(captureShortcode("quickly", "rayonnage"), '[quotebuilder_capture org="quickly" id="rayonnage"]');

const agent = agentWidgetSnippet("https://www.quotebuilder.co/", "quickly", "rayonnage");
assert.match(agent, /data-module="agent"/);
assert.equal(agentShortcode("quickly", "rayonnage"), '[quotebuilder_agent org="quickly" id="rayonnage"]');

const widget = readFileSync(new URL("../../app/widget.js/route.ts", import.meta.url), "utf8");
assert.match(widget, /moduleName === "capture"/);
assert.match(widget, /moduleName === "agent"/);
assert.match(widget, /\/capture/);
assert.match(widget, /\/agent/);
assert.match(widget, /type !== "resize"/);

const chatRoute = readFileSync(new URL("../../app/api/public/sessions/[id]/chat/route.ts", import.meta.url), "utf8");
const agentRoute = readFileSync(new URL("../../app/api/public/sessions/[id]/agent/route.ts", import.meta.url), "utf8");
assert.match(chatRoute, /requireChat: true/);
assert.match(agentRoute, /requireChat: false/);
assert.doesNotMatch(agentRoute, /chatEnabled/);
