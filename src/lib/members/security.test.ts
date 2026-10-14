import assert from "node:assert/strict";
import { escapeLike } from "@/lib/prospect/access";
import {
  isMemberLoginEmail,
  memberEmailIlikePattern,
  sessionEmailFromMatchedQuote,
} from "@/lib/members/email";
import {
  memberDocBelongsToSpace,
  memberDocStoragePath,
  memberResourceHref,
} from "@/lib/members/docs";

assert.equal(escapeLike("%@%"), "\\%@\\%");
assert.equal(escapeLike("user_name@example.com"), "user\\_name@example.com");
assert.equal(escapeLike("a\\b@c.com"), "a\\\\b@c.com");
assert.equal(escapeLike("plain@example.com"), "plain@example.com");
assert.equal(memberEmailIlikePattern("User_Name@Example.com"), "user\\_name@example.com");
assert.notEqual(memberEmailIlikePattern("%@%"), "%@%");

assert.equal(isMemberLoginEmail("%@%"), false);
assert.equal(isMemberLoginEmail("user%@example.com"), false);
assert.equal(isMemberLoginEmail("not-an-email"), false);
assert.equal(isMemberLoginEmail("user_name@example.com"), true);
assert.equal(isMemberLoginEmail("  User_Name@Example.com "), true);

assert.equal(sessionEmailFromMatchedQuote("%@%", "Claire@Atelier.fr"), "claire@atelier.fr");
assert.equal(sessionEmailFromMatchedQuote("%@%", "Claire@Atelier.fr"), sessionEmailFromMatchedQuote("other@example.com", " Claire@Atelier.fr "));
assert.notEqual(sessionEmailFromMatchedQuote("%@%", "Claire@Atelier.fr"), "%@%");
assert.equal(sessionEmailFromMatchedQuote("%@%", "%@%"), null);
assert.equal(sessionEmailFromMatchedQuote("%@%", null), null);
assert.equal(sessionEmailFromMatchedQuote("user_name@example.com", "User_Name@Example.com"), "user_name@example.com");

const orgId = "11111111-1111-4111-8111-111111111111";
const spaceId = "22222222-2222-4222-8222-222222222222";
const otherSpace = "33333333-3333-4333-8333-333333333333";
const storagePath = `${orgId}/${spaceId}/1710000000000.pdf`;
const publicUrl = `https://abc.supabase.co/storage/v1/object/public/member-docs/${storagePath}`;

assert.equal(memberDocStoragePath(storagePath), storagePath);
assert.equal(memberDocStoragePath(publicUrl), storagePath);
assert.equal(
  memberDocStoragePath(`https://abc.supabase.co/storage/v1/object/sign/member-docs/${storagePath}?token=abc`),
  storagePath,
);
assert.equal(memberDocStoragePath("https://evil.example/file.pdf"), null);
assert.equal(memberDocStoragePath(`${orgId}/${spaceId}/../../etc/passwd`), null);
assert.equal(memberDocStoragePath(`${orgId}/${spaceId}/..`), null);
assert.equal(memberDocBelongsToSpace(publicUrl, orgId, spaceId), true);
assert.equal(memberDocBelongsToSpace(storagePath, orgId, otherSpace), false);

const gated = memberResourceHref("demo", "espace", publicUrl);
assert.match(gated, /^\/api\/public\/membres\/demo\/espace\/doc\?path=/);
assert.ok(gated.includes(encodeURIComponent(storagePath)) || gated.includes(storagePath));
assert.equal(memberResourceHref("demo", "espace", "https://example.com/plugin.zip"), "https://example.com/plugin.zip");

console.log("members/security.test.ts: ok");
