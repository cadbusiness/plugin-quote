import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { captureShortcode, captureWidgetSnippet } from "./capture-embed";

const snippet = captureWidgetSnippet("https://www.quotebuilder.co/", "quickly", "rayonnage");
assert.match(snippet, /data-module="capture"/);
assert.match(snippet, /data-org="quickly"/);
assert.match(snippet, /data-id="rayonnage"/);
assert.match(snippet, /src="https:\/\/www\.quotebuilder\.co\/widget\.js"/);
assert.equal(captureShortcode("quickly", "rayonnage"), '[quotebuilder_capture org="quickly" id="rayonnage"]');

const widget = readFileSync(new URL("../../app/widget.js/route.ts", import.meta.url), "utf8");
assert.match(widget, /data-module"\) === "capture"/);
assert.match(widget, /\/capture/);
assert.match(widget, /type !== "resize"/);
