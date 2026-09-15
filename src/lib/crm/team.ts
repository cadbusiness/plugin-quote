import type { ChipTone } from "@/components/ui/chip";
import { getAppUrl } from "@/lib/supabase/env";

export const TEAM_ROLES = ["owner", "admin", "sales"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export const TEAM_STATUSES = ["pending", "active", "disabled"] as const;
export type TeamStatus = (typeof TEAM_STATUSES)[number];

const OPEN_STATUSES = new Set(["new", "contacted", "in_progress", "waiting"]);

export type MemberStats = {
  assigned: number;
  open: number;
  won: number;
  lost: number;
  hot: number;
  lastQuoteAt: string | null;
};

export type TeamMemberRow = {
  id: string;
  userId: string | null;
  email: string | null;
  role: string;
  status: string;
  createdAt: string;
  lastSignInAt: string | null;
  lastActivityAt: string | null;
  stats: MemberStats;
  isYou: boolean;
};

export type TeamCapability = {
  id: string;
  area: string;
  hint: string;
  allowed: boolean;
};

export type TeamMemberQuote = {
  id: string;
  contactName: string;
  company: string | null;
  status: string;
  scoreLabel: string | null;
  createdAt: string;
};

export type TeamMemberLog = {
  id: string;
  quoteId: string;
  contactName: string;
  label: string;
  when: string;
  createdAt: string;
};

export type TeamMemberDetail = TeamMemberRow & {
  capabilities: TeamCapability[];
  quotes: TeamMemberQuote[];
  logs: TeamMemberLog[];
};

export type TeamDirectory = {
  members: TeamMemberRow[];
  unassigned: number;
};

export type QuoteSlice = {
  id: string;
  status: string;
  score_label: string | null;
  assigned_to: string | null;
  contact_name: string;
  contact_company: string | null;
  created_at: string;
};

export function isTeamRole(value: string): value is TeamRole {
  return TEAM_ROLES.includes(value as TeamRole);
}

export function isTeamStatus(value: string): value is TeamStatus {
  return TEAM_STATUSES.includes(value as TeamStatus);
}

export function roleLabel(role: string) {
  if (role === "owner") return "Propriétaire";
  if (role === "admin") return "Admin";
  if (role === "sales") return "Commercial";
  return role;
}

export function roleTone(role: string): ChipTone {
  if (role === "owner") return "violet";
  if (role === "admin") return "orange";
  if (role === "sales") return "sky";
  return "slate";
}

export function quoteStatusLabel(slug: string) {
  if (slug === "new") return "Nouveau";
  if (slug === "contacted") return "Contacté";
  if (slug === "in_progress") return "En cours";
  if (slug === "won") return "Gagné";
  if (slug === "lost") return "Perdu";
  if (slug === "waiting") return "En attente";
  return slug;
}

export function memberStatusLabel(status: string) {
  if (status === "pending") return "Invitation";
  if (status === "active") return "Actif";
  if (status === "disabled") return "Suspendu";
  return status;
}

export function memberStatusTone(status: string): ChipTone {
  if (status === "pending") return "amber";
  if (status === "active") return "emerald";
  if (status === "disabled") return "slate";
  return "slate";
}

export function memberListLabel(email: string | null | undefined, role: string) {
  const trimmed = email?.trim();
  return trimmed || roleLabel(role);
}

export function emptyMemberStats(): MemberStats {
  return { assigned: 0, open: 0, won: 0, lost: 0, hot: 0, lastQuoteAt: null };
}

export function conversionRate(stats: MemberStats) {
  if (!stats.assigned) return null;
  return Math.round((stats.won / stats.assigned) * 100);
}

export function quoteIdsForUser(
  userId: string,
  quotes: { id: string; assigned_to: string | null }[],
  assignees: { quote_id: string; user_id: string }[],
) {
  const ids = new Set<string>();
  for (const row of assignees) {
    if (row.user_id === userId) ids.add(row.quote_id);
  }
  for (const quote of quotes) {
    if (quote.assigned_to === userId) ids.add(quote.id);
  }
  return ids;
}

export function tallyMemberStats(quotes: QuoteSlice[]): MemberStats {
  const stats = emptyMemberStats();
  for (const quote of quotes) {
    stats.assigned += 1;
    if (OPEN_STATUSES.has(quote.status)) stats.open += 1;
    if (quote.status === "won") stats.won += 1;
    if (quote.status === "lost") stats.lost += 1;
    if (quote.score_label === "hot") stats.hot += 1;
    if (!stats.lastQuoteAt || quote.created_at > stats.lastQuoteAt) stats.lastQuoteAt = quote.created_at;
  }
  return stats;
}

type CapabilityDef = { id: string; area: string; hint: string; roles: readonly TeamRole[] };

export const TEAM_CAPABILITIES: CapabilityDef[] = [
  { id: "accueil", area: "Tableau de bord", hint: "KPI, pipeline, modules d’accueil", roles: ["owner", "admin", "sales"] },
  { id: "devis", area: "Demandes", hint: "Fiches, notes, assignation, statut", roles: ["owner", "admin", "sales"] },
  { id: "membres", area: "Espace membres", hint: "Portail client, documents, plugins", roles: ["owner", "admin"] },
  { id: "sessions", area: "Abandons", hint: "Sessions inachevées à relancer", roles: ["owner", "admin", "sales"] },
  { id: "emails", area: "Emails marketing", hint: "Campagnes perso ou groupe", roles: ["owner", "admin", "sales"] },
  { id: "segments", area: "Segmentation", hint: "Listes B2B / hot / relance", roles: ["owner", "admin", "sales"] },
  { id: "stats", area: "Statistiques", hint: "Tunnel, sources, pipeline", roles: ["owner", "admin", "sales"] },
  { id: "canaux", area: "Canaux perso", hint: "Boîte mail du commercial", roles: ["owner", "admin", "sales"] },
  { id: "funnels", area: "Funnels", hint: "Créer et éditer les parcours devis", roles: ["owner", "admin"] },
  { id: "catalogue", area: "Catalogue", hint: "Produits, Si/Alors, imports", roles: ["owner", "admin"] },
  { id: "ads", area: "Google Ads", hint: "Connexion, conversions, ROI", roles: ["owner", "admin"] },
  { id: "boutiques", area: "Boutiques", hint: "Mini-site, Woo, Shopify", roles: ["owner", "admin"] },
  { id: "automations", area: "Automatisations", hint: "Canvas, parcours, exécutions", roles: ["owner", "admin"] },
  { id: "equipe", area: "Équipe", hint: "Inviter, rôles, accès, journal", roles: ["owner", "admin"] },
  { id: "canaux-org", area: "Canaux de l’espace", hint: "Boîte partagée de l’organisation", roles: ["owner", "admin"] },
  { id: "api", area: "API et webhooks", hint: "Clés MCP Claude / ChatGPT, exports", roles: ["owner", "admin"] },
  { id: "parametres", area: "Paramètres", hint: "Templates, suivi, RGPD", roles: ["owner", "admin"] },
];

export function capabilitiesForRole(role: string): TeamCapability[] {
  const key: TeamRole = isTeamRole(role) ? role : "sales";
  return TEAM_CAPABILITIES.map((item) => ({
    id: item.id,
    area: item.area,
    hint: item.hint,
    allowed: item.roles.includes(key),
  }));
}

export function roleBlurb(role: string) {
  if (role === "owner") return "Tout l’espace. Le compte ne peut pas être rétrogradé ni suspendu.";
  if (role === "admin") return "Configure funnels, catalogue, équipe et automatisations. Traite aussi les demandes.";
  return "Traite les demandes, relance les abandons, envoie des emails. Pas d’accès aux réglages.";
}

export function memberAccessEmail(input: { orgName: string; role: string; token?: string | null }) {
  const app = getAppUrl();
  const loginNext = input.token ? `/invite/${input.token}` : "/accueil";
  const signup = `${app}/signup?next=${encodeURIComponent(loginNext)}`;
  const login = `${app}/login?next=${encodeURIComponent(loginNext)}`;
  const pending = Boolean(input.token);
  return {
    subject: pending ? `Invitation ${input.orgName}` : `Accès ${input.orgName}`,
    body: pending
      ? `Vous êtes invité sur QuoteBuilder (${input.orgName}) en tant que ${roleLabel(input.role).toLowerCase()}.

Créer votre accès :
${signup}

Déjà un compte ? Connectez-vous :
${login}
`
      : `Votre accès QuoteBuilder (${input.orgName}) est prêt, en tant que ${roleLabel(input.role).toLowerCase()}.

Connexion :
${login}
`,
  };
}

export function memberPasswordEmail(orgName: string, actionLink: string) {
  return {
    subject: `Mot de passe ${orgName}`,
    body: `Voici le lien pour définir ou réinitialiser votre mot de passe QuoteBuilder (${orgName}) :

${actionLink}

Le lien expire après quelques heures. Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.
`,
  };
}

export function canManageMember(actorRole: string, member: { role: string; userId: string | null }, actorUserId: string) {
  if (!["owner", "admin"].includes(actorRole)) return false;
  if (member.role === "owner") return false;
  if (member.userId && member.userId === actorUserId) return false;
  return true;
}

export function filterTeamMembers(
  members: TeamMemberRow[],
  filters: { q?: string; role?: string; status?: string },
) {
  const q = filters.q?.trim().toLowerCase() ?? "";
  return members.filter((member) => {
    if (filters.role && member.role !== filters.role) return false;
    if (filters.status && member.status !== filters.status) return false;
    if (!q) return true;
    const hay = `${member.email ?? ""} ${roleLabel(member.role)} ${memberStatusLabel(member.status)}`.toLowerCase();
    return hay.includes(q);
  });
}

export function teamKpis(members: TeamMemberRow[], unassigned: number) {
  const active = members.filter((member) => member.status === "active");
  const pending = members.filter((member) => member.status === "pending").length;
  const sales = active.filter((member) => member.role === "sales").length;
  const assigned = members.reduce((sum, member) => sum + member.stats.assigned, 0);
  return [
    { id: "active", label: "Actifs", value: String(active.length), hint: `${members.length} au total` },
    { id: "pending", label: "Invitations", value: String(pending), hint: pending ? "En attente d’ouverture" : "Aucune en cours" },
    { id: "sales", label: "Commerciaux", value: String(sales), hint: "Rôle commercial actif" },
    { id: "assigned", label: "Demandes suivies", value: String(assigned), hint: unassigned ? `${unassigned} non assignées` : "Toutes assignées" },
  ];
}