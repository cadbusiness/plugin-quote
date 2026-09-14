import assert from "node:assert/strict";
import { pkceChallengeS256, verifyPkceS256 } from "./pkce";
import { isAllowedRedirectUri, isPublicHttpsUrl } from "./cimd";
import { parseAuthorizeRequest } from "./oauth";
import { organizationIdFromAuth } from "./auth";
import { MCP_PATH, mcpResourceUrl } from "./urls";
import { errorResult, textResult } from "./results";

const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
const challenge = pkceChallengeS256(verifier);
assert.equal(verifyPkceS256(verifier, challenge), true);
assert.equal(verifyPkceS256("nope", challenge), false);

assert.equal(isAllowedRedirectUri("https://chatgpt.com/connector_platform_oauth_redirect"), true);
assert.equal(isAllowedRedirectUri("http://localhost:1455/callback"), true);
assert.equal(isAllowedRedirectUri("http://evil.test/cb"), false);
assert.equal(isAllowedRedirectUri("https://ok.example/#frag"), false);

assert.equal(isPublicHttpsUrl("https://chatgpt.com/.well-known/oauth-client"), true);
assert.equal(isPublicHttpsUrl("https://127.0.0.1/secret"), false);
assert.equal(isPublicHttpsUrl("https://10.0.0.3/client"), false);
assert.equal(isPublicHttpsUrl("http://example.com/client"), false);

const ok = parseAuthorizeRequest(
  new URL(
    "https://www.quotebuilder.co/oauth/authorize?response_type=code&client_id=abc&redirect_uri=https://chatgpt.com/cb&code_challenge=xyz&code_challenge_method=S256&state=s1",
  ),
);
assert.equal("error" in ok, false);
if (!("error" in ok)) {
  assert.equal(ok.clientId, "abc");
  assert.equal(ok.redirectUri, "https://chatgpt.com/cb");
  assert.equal(ok.state, "s1");
}

const bad = parseAuthorizeRequest(new URL("https://www.quotebuilder.co/oauth/authorize?client_id=abc"));
assert.equal("error" in bad, true);

assert.equal(organizationIdFromAuth({ token: "t", clientId: "c", scopes: ["mcp"], extra: { organizationId: "org-1" } }), "org-1");
assert.throws(() => organizationIdFromAuth(undefined), /Organisation introuvable/);

assert.equal(MCP_PATH, "/api/mcp");
assert.match(mcpResourceUrl("https://www.quotebuilder.co"), /\/api\/mcp$/);

const payload = textResult({ id: "q1" });
assert.equal(payload.content[0]?.type, "text");
assert.match(payload.content[0]?.text ?? "", /q1/);
const err = errorResult(new Error("boom"));
assert.equal(err.isError, true);
assert.equal(err.content[0]?.text, "boom");

console.log("mcp helpers ok");
