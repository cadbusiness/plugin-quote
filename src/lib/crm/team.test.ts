import assert from "node:assert/strict";
import { postSignupPath, safeNextPath } from "../auth/next-path";
import {
  canManageMember,
  capabilitiesForRole,
  conversionRate,
  emptyMemberStats,
  filterTeamMembers,
  memberAccessEmail,
  memberListLabel,
  memberStatusLabel,
  memberStatusTone,
  quoteIdsForUser,
  roleBlurb,
  roleLabel,
  roleTone,
  tallyMemberStats,
  teamKpis,
} from "./team";

assert.equal(safeNextPath("/invite/abc"), "/invite/abc");
assert.equal(safeNextPath("//evil"), null);
assert.equal(postSignupPath("/invite/abc"), "/invite/abc");
assert.equal(postSignupPath("/devis"), "/onboarding?next=%2Fdevis");
assert.equal(postSignupPath(null), "/onboarding");

assert.equal(roleLabel("owner"), "Propriétaire");
assert.equal(roleLabel("admin"), "Admin");
assert.equal(roleLabel("sales"), "Commercial");
assert.equal(roleTone("owner"), "violet");
assert.equal(roleTone("sales"), "sky");
assert.equal(memberStatusLabel("pending"), "Invitation");
assert.equal(memberStatusLabel("active"), "Actif");
assert.equal(memberStatusLabel("disabled"), "Suspendu");
assert.equal(memberStatusTone("pending"), "amber");
assert.equal(memberStatusTone("active"), "emerald");
assert.equal(memberListLabel("sales@quotebuilder.app", "sales"), "sales@quotebuilder.app");
assert.equal(memberListLabel(null, "owner"), "Propriétaire");

const ids = quoteIdsForUser(
  "u1",
  [
    { id: "q1", assigned_to: "u1" },
    { id: "q2", assigned_to: null },
    { id: "q3", assigned_to: "u2" },
  ],
  [
    { quote_id: "q2", user_id: "u1" },
    { quote_id: "q3", user_id: "u1" },
  ],
);
assert.deepEqual([...ids].sort(), ["q1", "q2", "q3"]);

const stats = tallyMemberStats([
  { id: "q1", status: "won", score_label: "hot", assigned_to: "u1", contact_name: "A", contact_company: null, created_at: "2026-09-01T10:00:00Z" },
  { id: "q2", status: "new", score_label: "warm", assigned_to: "u1", contact_name: "B", contact_company: null, created_at: "2026-09-10T10:00:00Z" },
  { id: "q3", status: "lost", score_label: "cold", assigned_to: "u1", contact_name: "C", contact_company: null, created_at: "2026-09-02T10:00:00Z" },
]);
assert.equal(stats.assigned, 3);
assert.equal(stats.open, 1);
assert.equal(stats.won, 1);
assert.equal(stats.lost, 1);
assert.equal(stats.hot, 1);
assert.equal(stats.lastQuoteAt, "2026-09-10T10:00:00Z");
assert.equal(conversionRate(stats), 33);
assert.equal(conversionRate(emptyMemberStats()), null);

const salesCaps = capabilitiesForRole("sales");
assert.ok(salesCaps.find((item) => item.id === "devis")?.allowed);
assert.equal(salesCaps.find((item) => item.id === "equipe")?.allowed, false);
assert.ok(capabilitiesForRole("admin").find((item) => item.id === "equipe")?.allowed);
assert.match(roleBlurb("sales"), /demandes/);

assert.equal(canManageMember("admin", { role: "sales", userId: "u2" }, "u1"), true);
assert.equal(canManageMember("admin", { role: "owner", userId: "u0" }, "u1"), false);
assert.equal(canManageMember("admin", { role: "sales", userId: "u1" }, "u1"), false);
assert.equal(canManageMember("sales", { role: "sales", userId: "u2" }, "u1"), false);

const mail = memberAccessEmail({ orgName: "Atelier", role: "sales", token: "tok-1" });
assert.match(mail.subject, /Atelier/);
assert.match(mail.body, /\/signup\?next=%2Finvite%2Ftok-1/);
assert.match(mail.body, /\/login\?next=%2Finvite%2Ftok-1/);
assert.match(mail.body, /commercial/);

const loginMail = memberAccessEmail({ orgName: "Atelier", role: "admin" });
assert.match(loginMail.subject, /Accès/);
assert.match(loginMail.body, /\/login\?next=%2Faccueil/);

const kpis = teamKpis(
  [
    {
      id: "1",
      userId: "u1",
      email: "a@x.fr",
      role: "owner",
      status: "active",
      createdAt: "",
      lastSignInAt: null,
      lastActivityAt: null,
      stats: { ...emptyMemberStats(), assigned: 2 },
      isYou: true,
    },
    {
      id: "2",
      userId: null,
      email: "b@x.fr",
      role: "sales",
      status: "pending",
      createdAt: "",
      lastSignInAt: null,
      lastActivityAt: null,
      stats: emptyMemberStats(),
      isYou: false,
    },
  ],
  4,
);
assert.equal(kpis[0]?.value, "1");
assert.equal(kpis[1]?.value, "1");
assert.equal(kpis[3]?.hint, "4 non assignées");

const filtered = filterTeamMembers(
  [
    {
      id: "1",
      userId: null,
      email: "lea@atelier.fr",
      role: "sales",
      status: "active",
      createdAt: "",
      lastSignInAt: null,
      lastActivityAt: null,
      stats: emptyMemberStats(),
      isYou: false,
    },
  ],
  { q: "lea", role: "sales", status: "active" },
);
assert.equal(filtered.length, 1);
assert.equal(filterTeamMembers(filtered, { q: "owner" }).length, 0);

console.log("crm/team ok");
