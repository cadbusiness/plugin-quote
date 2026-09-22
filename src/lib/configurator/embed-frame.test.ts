import assert from "node:assert/strict";
import { embedFrameBox, EMBED_DEFAULT_HEIGHT, EMBED_MOBILE_HEIGHT } from "./embed-frame";

assert.deepEqual(embedFrameBox(null, 1280), { height: EMBED_DEFAULT_HEIGHT, minHeight: EMBED_DEFAULT_HEIGHT });
assert.deepEqual(embedFrameBox("640px", 900), { height: "640px", minHeight: "640px" });
assert.deepEqual(embedFrameBox("720px", 390), { height: EMBED_MOBILE_HEIGHT, minHeight: "28rem" });
assert.equal(embedFrameBox("  ", 400).height, EMBED_MOBILE_HEIGHT);

console.log("embed-frame.test.ts ok");
